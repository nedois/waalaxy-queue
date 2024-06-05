import { z } from 'zod';
import express from 'express';
import { ActionSchema, CreateActionDtoSchema } from '@waalaxy/contract';

import { database } from '../database';
import { uuid } from '../utils';

const router = express.Router();

router.get('/', (request, response) => {
  const actions = database.getUserActions(request.userId);
  const data = z.array(ActionSchema).parse(actions);
  response.status(200).send(data);
});

router.post('/', (request, response) => {
  const dto = CreateActionDtoSchema.parse(request.body);
  const action = ActionSchema.parse({
    ...dto,
    id: uuid(),
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  database.createUserAction(request.userId, action);

  response.status(201).send(action);
});

export default router;
