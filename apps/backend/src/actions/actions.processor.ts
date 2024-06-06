import { parentPort } from 'node:worker_threads';
import assert from 'node:assert';

import { database } from '../database';
import { WorkerPostMessage } from './actions.worker';
import { ActionsScheduler } from './actions.scheduler';

assert(parentPort, 'Not running as a worker');

const scheduler = new ActionsScheduler();

parentPort.on('message', async ({ userId, event }: WorkerPostMessage) => {
  if (event === 'ACTION:CREATED') {
    await scheduler.scheduleNextAction(userId);
  }
});

async function onInit() {
  const users = await database.getUsers();

  users.forEach(async (user) => {
    await scheduler.scheduleNextAction(user.id);
  });
}

onInit();
