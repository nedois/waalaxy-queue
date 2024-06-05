import express from 'express';
import { ActionSchema, CreateActionDtoSchema } from '@waalaxy/contract';

import { database } from '../database';
import { uuid } from '../utils';
import { Worker } from './actions.worker';

const router = express.Router();

const worker = Worker.getInstance();

router.get('/', async (request, response) => {
  const actions = await database.getUserActions(request.userId);
  response.status(200).send(actions);
});

router.post('/', async (request, response) => {
  const dto = CreateActionDtoSchema.parse(request.body);

  const action = ActionSchema.parse({
    ...dto,
    id: uuid(),
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await database.createUserAction(request.userId, action);
  await database.addUserToHotList(request.userId);

  worker.process(request.userId, 'ACTION:CREATED');

  response.status(201).send(action);
});

export default router;
