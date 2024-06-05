import express from 'express';
import { ActionSchema, CreateActionDtoSchema } from '@waalaxy/contract';

import { database } from '../database';
import { uuid } from '../utils';
import { Worker, WorkerEventHandler } from './actions.worker';

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

router.get('/subscribe', (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const notificationHandler: WorkerEventHandler = (message: any) => {
    if (message.userId === request.userId) {
      response.write(`data: ${JSON.stringify(message.data)}\n\n`);
    }
  };

  worker.subscribe(notificationHandler);

  request.on('close', () => {
    worker.unsubscribe(notificationHandler);
    response.end();
  });
});

export default router;
