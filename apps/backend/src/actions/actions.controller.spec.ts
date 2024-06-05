import express, { type Express } from 'express';
import client from 'supertest';
import { z } from 'zod';
import { ActionSchema } from '@waalaxy/contract';

import { database } from '../database';
import { auth } from '../auth';
import { uuid } from '../utils';
import actionsController from './actions.controller';

const USER_ID = 'user-1';

const actions = (['A', 'B', 'C'] as const).map((name) => ({
  id: uuid(),
  name,
  status: 'PENDING' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

describe('Actions Controller', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(auth);
    app.use('/actions', actionsController);

    // Create actions for a user
    database.reset();
    actions.forEach((action) => database.createUserAction(USER_ID, action));
  });

  it('GET /actions should return user actions', async () => {
    const response = await client(app).get('/actions').set('Authorization', `Bearer ${USER_ID}`);
    expect(response.status).toBe(200);

    const data = z.array(ActionSchema).parse(response.body);
    expect(data).toEqual(actions);
  });
});
