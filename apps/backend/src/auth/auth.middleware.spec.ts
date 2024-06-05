import express, { type Express } from 'express';
import client from 'supertest';

import { auth } from './auth.middleware';

describe('Auth middleware', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(auth);

    app.get('/protected', (request, response) => {
      response.status(200).send({ message: 'Authenticated', userId: request.userId });
    });
  });

  it('should respond with 401 if authorization header is missing', async () => {
    const response = await client(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  it('should respond with 401 if authorization header is invalid', async () => {
    const response = await client(app).get('/protected').set('Authorization', 'Invalid token');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  it('should set userId and call next if authorization header is valid', async () => {
    const userId = 'user123';
    const response = await client(app).get('/protected').set('Authorization', `Bearer ${userId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Authenticated', userId });
  });
});
