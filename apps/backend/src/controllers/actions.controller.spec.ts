import express, { type Express } from 'express';
import client from 'supertest';
import { bootstrap } from '../bootstrap';
import { container } from '../di';
import { Action } from '@repo/domain';

describe('ActionsController', () => {
  let app: Express;
  let token: string;
  let userId: string;

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick'] });
    app = await bootstrap(express());

    const response = await client(app).post('/auth/login').send({ username: 'username1' });
    token = `Bearer ${response.body.token}`;
    userId = response.body.token;
  });

  afterEach(async () => {
    await container.dispose();
    jest.useRealTimers();
  });

  describe('GET /actions', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await client(app).get('/actions');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    it('should return the user actions', async () => {
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
          name: 'B',
          runnedAt: new Date(),
          status: 'COMPLETED',
          userId,
        }),
      ];

      await Promise.all(actions.map((action) => container.actionRepository.save(action)));

      const response = await client(app).get('/actions').set('Authorization', token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toEqual(
        actions.map((action) => ({
          id: action.id,
          name: action.name,
          createdAt: action.createdAt.toISOString(),
          updatedAt: action.updatedAt.toISOString(),
          runnedAt: action.runnedAt?.toISOString(),
          status: action.status,
          userId,
        }))
      );
    });
  });

  describe('POST /actions', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await client(app).post('/actions').send({ name: 'C' });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    it('should create a new action if payload is valid', async () => {
      const response = await client(app).post('/actions').set('Authorization', token).send({ name: 'C' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        name: 'C',
        runnedAt: null,
        status: 'PENDING',
        userId,
      });
    });

    it('should throw a validation error if payload is invalid', async () => {
      const response = await client(app).post('/actions').set('Authorization', token).send({ name: 'invalid-action' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Validation Error',
        errors: [{ field: 'name', message: expect.any(String) }],
      });
    });
  });
});
