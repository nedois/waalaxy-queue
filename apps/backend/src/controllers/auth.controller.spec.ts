import express, { type Express } from 'express';
import client from 'supertest';
import { bootstrap } from '../bootstrap';
import { container } from '../di';

describe('AuthController', () => {
  let app: Express;

  beforeEach(async () => {
    app = await bootstrap(express());
  });

  afterEach(async () => {
    await container.dispose();
  });

  describe('POST /auth/login', () => {
    it('should return an authentication token if payload is valid', async () => {
      const response = await client(app).post('/auth/login').send({ username: 'username' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ token: expect.any(String) });
    });

    it('should throw a validation error if payload is invalid', async () => {
      const response = await client(app).post('/auth/login').send({ email: 'john.doe@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Validation error',
        errors: expect.objectContaining({
          username: expect.arrayContaining([expect.any(String)]),
        }),
      });
    });
  });
});
