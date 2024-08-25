import { Action } from '@repo/domain';
import express, { type Express } from 'express';
import client from 'supertest';
import { bootstrap } from '../bootstrap';
import { container } from '../di';

describe('QueueController', () => {
  let app: Express;
  let token: string;
  let userId: string;

  beforeEach(async () => {
    jest.useFakeTimers();
    app = await bootstrap(express());

    const response = await client(app).post('/auth/login').send({ username: 'username1' });
    token = `Bearer ${response.body.token}`;
    userId = response.body.token;
  });

  afterEach(async () => {
    await container.dispose();
    jest.useFakeTimers();
  });

  describe('GET /queue', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await client(app).get('/queue');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    it('should return the user queue', async () => {
      const actions = [
        new Action({
          id: 'ad67bb1b-be11-4009-bcd4-1594ee2996d9',
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'A',
          runnedAt: null,
          status: 'PENDING',
          userId,
        }),
        new Action({
          id: '41a1311f-7805-4698-ba62-4f1718402e95',
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'C',
          runnedAt: null,
          status: 'PENDING',
          userId,
        }),
      ];

      await Promise.all(actions.map((action) => container.actionRepository.save(action)));
      await Promise.all(actions.map((action) => container.queueProcessor.enqueueAction(action)));

      const response = await client(app).get('/queue').set('Authorization', token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(
        actions
          .filter((action) => action.status !== 'COMPLETED')
          .map((action) => ({
            id: action.id,
            name: action.name,
            createdAt: action.createdAt.toISOString(),
            updatedAt: action.updatedAt.toISOString(),
            runnedAt: null,
            status: action.status,
            userId,
          }))
      );
    });
  });
});
