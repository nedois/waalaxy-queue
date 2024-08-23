import express, { type Express } from 'express';
import client from 'supertest';
import { bootstrap } from '../bootstrap';
import { container } from '../di';

describe('AccountController', () => {
  let app: Express;

  beforeEach(async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick'] });
    app = await bootstrap(express());
  });

  afterEach(async () => {
    await container.dispose();
    jest.useRealTimers();
  });

  it('GET /account should return the user info if authenticated', async () => {
    const authResponse = await client(app).post('/auth/login').send({ username: 'username1' });

    const response = await client(app).get('/account').set('Authorization', `Bearer ${authResponse.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: expect.any(String),
      username: 'username1',
      lockedQueueAt: null,
      lastActionExecutedAt: null,
    });
  });

  it('GET /account should return 401 if not authenticated', async () => {
    const response = await client(app).get('/account');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });
});
