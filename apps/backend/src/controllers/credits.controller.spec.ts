import express, { type Express } from 'express';
import client from 'supertest';
import { bootstrap } from '../bootstrap';
import { container } from '../di';

describe('CreditsController', () => {
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

  describe('GET /credits', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await client(app).get('/credits');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
    });

    it('should return the user credits', async () => {
      const response = await client(app).get('/credits').set('Authorization', token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      response.body.forEach((credit: unknown) =>
        expect(credit).toStrictEqual({
          id: expect.any(String),
          actionName: expect.any(String),
          amount: expect.any(Number),
        })
      );
    });
  });
});
