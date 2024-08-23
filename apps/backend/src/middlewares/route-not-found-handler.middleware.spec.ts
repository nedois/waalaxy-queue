import express, { type Express } from 'express';
import client from 'supertest';
import { routeNotFoundHandlerMiddleware } from './route-not-found-handler.middleware';

describe('RouteNotFoundHandlerMiddleware', () => {
  let app: Express;

  beforeEach(() => {
    app = express();

    app.use(routeNotFoundHandlerMiddleware);
  });

  it('should return 404 status code if no route is found', async () => {
    const response = await client(app).get('/protected');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Route not found' });
  });
});
