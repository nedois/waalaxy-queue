import { z } from 'zod';
import express from 'express';
import { ActionSchema } from '@waalaxy/contract';

import { database } from '../database';

const router = express.Router();

router.get('/', (request, response) => {
  const actions = database.getUserActions(request.userId);
  const data = z.array(ActionSchema).parse(actions);
  response.status(200).send(data);
});

router.post('/', (request, response) => {
  response.send({ message: 'Action created' });
});

export default router;
