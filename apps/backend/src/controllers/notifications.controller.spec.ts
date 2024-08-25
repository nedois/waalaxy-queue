import express, { type Express } from 'express';
import client from 'supertest';
import { bootstrap } from '../bootstrap';
import { container } from '../di';

describe('NotificationsController', () => {
  let app: Express;

  beforeEach(async () => {
    app = await bootstrap(express());
  });

  afterEach(async () => {
    await container.dispose();
  });

  describe('GET /notifications/subscribe', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await client(app).get('/notifications/subscribe');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized' });
    });
  });
});
