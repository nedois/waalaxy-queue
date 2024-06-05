import { z } from 'zod';
import express from 'express';
import { ActionNameSchema, CreditSchema } from '@waalaxy/contract';

import { database } from '../database';

const router = express.Router();

router.get('/', async (request, response) => {
  const credits = await database.getUserCredits(request.userId);
  const data = z.record(ActionNameSchema, CreditSchema).parse(credits);
  response.status(200).send(data);
});

export default router;
