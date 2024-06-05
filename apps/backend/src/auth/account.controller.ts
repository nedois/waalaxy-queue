import express from 'express';

import { database } from '../database';

const router = express.Router();

router.get('/', async (request, response) => {
  const user = await database.getUser(request.userId);
  response.status(200).send(user);
});

export default router;
