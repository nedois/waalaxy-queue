import express, { type Express } from 'express';
import client from 'supertest';

import { database } from '../database';
import { errorHandler } from '../errors';
import { auth } from '../auth';
import creditsController from './credits.controller';

const USER_ID = 'John';

describe('Credits Controller', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(auth);
    app.use('/credits', creditsController);
    app.use(errorHandler);

    // Renew user credits
    database.reset();
    database.registerUser(USER_ID);
  });

  it('GET /actions should return user default credits', async () => {
    const response = await client(app).get('/credits').set('Authorization', `Bearer ${USER_ID}`);
    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('A');
    expect(response.body).toHaveProperty('B');
    expect(response.body).toHaveProperty('C');
  });
});
