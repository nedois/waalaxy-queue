import express, { type Express } from 'express';
import client from 'supertest';

import { database } from '../database';
import { errorHandler } from '../errors';
import { auth } from '../auth';
import creditsController from './credits.controller';

const USER_ID = 'user-1';

const credits = {
  A: { amount: 1 },
  B: { amount: 2 },
  C: { amount: 3 },
} as const;

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
    database.renewUserActionsCredit(USER_ID, credits);
  });

  it('GET /actions should return user actions', async () => {
    const response = await client(app).get('/credits').set('Authorization', `Bearer ${USER_ID}`);
    expect(response.status).toBe(200);

    expect(response.body).toEqual(credits);
  });
});
