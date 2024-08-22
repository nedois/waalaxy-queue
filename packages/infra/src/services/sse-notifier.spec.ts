import { Notification, User } from '@repo/domain';
import type { Request, Response } from 'express';
import { MockRequest, MockResponse, createRequest, createResponse } from 'node-mocks-http';
import { SSENotifier } from './sse-notifier';

describe('SSENotifier', () => {
  let sseNotifier: SSENotifier;
  let request: MockRequest<Request>;
  let response: MockResponse<Response>;

  const user = new User({
    id: '4310a855-19b2-4af7-815e-019cfa5c31d1',
    username: 'user',
    lastActionExecutedAt: null,
    lockedQueueAt: null,
  });

  beforeEach(() => {
    sseNotifier = new SSENotifier();
    request = createRequest({ user });
    response = createResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('subscribe', () => {
    it('should set the correct headers and handle request close event', () => {
      const requestSpy = jest.spyOn(request, 'on');

      sseNotifier.subscribe(request, response);

      expect(response.statusCode).toBe(200);
      expect(response.getHeader('Content-Type')).toBe('text/event-stream');
      expect(response.getHeader('Cache-Control')).toBe('no-cache');
      expect(response.getHeader('Pragma')).toBe('no-cache');
      expect(response.getHeader('Connection')).toBe('keep-alive');
      expect(response.getHeader('X-Accel-Buffering')).toBe('no');

      expect(requestSpy).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('realtime', () => {
    it('should send a notification if there is an active connection and the user is the owner of the notification', () => {
      sseNotifier.subscribe(request, response);

      const notification = new Notification({
        id: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        type: 'ACTION_COMPLETED',
        message: 'Hello, world!',
      });

      sseNotifier.realtime(user.id, notification);

      // eslint-disable-next-line no-underscore-dangle
      expect(response._getData()).toBe(`data: ${JSON.stringify(notification)}\n\n`);
    });

    it('should not send a notification if there is an active connection and the user is not the owner of the notification', () => {
      sseNotifier.subscribe(request, response);

      const notification = new Notification({
        id: '4310a855-19b2-4af7-815e-019cfa5c31d2',
        type: 'ACTION_COMPLETED',
        message: 'Hello, world!',
      });

      sseNotifier.realtime('not_the_owner_id', notification);

      // eslint-disable-next-line no-underscore-dangle
      expect(response._getData()).toBe('');
    });

    it('should not send a notification if there is no active connection', () => {
      const notification = new Notification({
        id: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        type: 'ACTION_COMPLETED',
        message: 'Hello, world!',
      });

      sseNotifier.realtime(user.id, notification);

      // eslint-disable-next-line no-underscore-dangle
      expect(response._getData()).toBe('');
    });
  });
});
