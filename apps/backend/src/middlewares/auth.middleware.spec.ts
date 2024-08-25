import { User } from '@repo/domain';
import express, { type Express } from 'express';
import client from 'supertest';
import { container } from '../di';
import { authMiddleware } from './auth.middleware';

describe('AuthMiddleware', () => {
  let app: Express;

  const user = new User({
    id: '41a1311f-7805-4698-ba62-4f1718402e95',
    lastActionExecutedAt: null,
    lockedQueueAt: null,
    username: 'username1',
  });

  const token = `Bearer ${user.id}`;
  const userId = user.id;

  beforeEach(async () => {
    jest.useFakeTimers();

    app = express();
    app.use(authMiddleware);

    container.userRepository.findOne = jest.fn().mockResolvedValue(user);

    app.get('/protected', (request, response) => {
      response.status(200).send({ message: 'Authenticated', userId: request.user.id });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should respond with 401 if authorization header  or query token is missing', async () => {
    const response = await client(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  it('should respond with 401 if authorization header is invalid', async () => {
    const response = await client(app).get('/protected').set('Authorization', 'Invalid token');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  it('should return the userId if authorization header is valid', async () => {
    const response = await client(app).get('/protected').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Authenticated', userId });
  });

  it('should return the userId if query token is valid', async () => {
    const response = await client(app).get(`/protected?token=${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Authenticated', userId });
  });
});
