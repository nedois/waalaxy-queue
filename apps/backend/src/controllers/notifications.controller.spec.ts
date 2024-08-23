import express, { type Express } from 'express';
import client from 'supertest';
import { bootstrap } from '../bootstrap';
import { container } from '../di';
import { SSENotifier } from '@repo/infra';

describe('NotificationsController', () => {
  let app: Express;
  let token: string;

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick'] });
    app = await bootstrap(express());

    const response = await client(app).post('/auth/login').send({ username: 'username1' });
    token = `Bearer ${response.body.token}`;
  });

  afterEach(async () => {
    await container.dispose();
    jest.useRealTimers();
  });

  describe('GET /notifications/subscribe', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await client(app).get('/notifications/subscribe');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    it('should subscribe to notifications if authenticated', async () => {
      const response = await client(app).get('/notifications/subscribe').set('Authorization', token);

      expect(response.status).toBe(200);

      if (container.notifier instanceof SSENotifier) {
        const subscribeSpy = jest.spyOn(container.notifier, 'subscribe');
        expect(subscribeSpy).toHaveBeenCalledTimes(1);
      }
    });
  });
});
