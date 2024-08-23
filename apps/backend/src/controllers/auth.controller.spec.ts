import express, { type Express } from 'express';
import client from 'supertest';
import { bootstrap } from '../bootstrap';
import { container } from '../di';

describe('AuthController', () => {
  let app: Express;

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick'] });
    app = await bootstrap(express());
  });

  afterEach(async () => {
    await container.dispose();
    jest.useRealTimers();
  });

  describe('POST /login/auth', () => {
    it('should return an authentication token if payload is valid', async () => {
      const response = await client(app).post('/login/auth').send({ username: 'username' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ token: expect.any(String) });
    });

    it('should throw a validation error if payload is invalid', async () => {
      const response = await client(app).post('/login/auth').send({ email: 'john.doe@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Validation Error',
        errors: [{ field: 'username', message: expect.any(String) }],
      });
    });
  });
});
