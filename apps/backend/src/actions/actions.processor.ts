import { parentPort } from 'node:worker_threads';
import assert from 'node:assert';
import { Action, type ActionName } from '@waalaxy/contract';

import { env } from '../env';
import { BaseAction } from './base.action';
import { actionInstances } from './actions.handlers';
import { BaseWorkerMessage, WorkerPostMessage } from './actions.worker';
import { InMemoryDatabase } from '../database/in-memory.database';
import { RedisDatabase } from '../database/redis.database';
import { timeDifferenceInMilliseconds } from '../utils';

assert(parentPort, 'Not running as a worker');

const isMemoryDatabase = env.DB_TYPE === 'memory';

let database = isMemoryDatabase ? new InMemoryDatabase() : new RedisDatabase();

parentPort.on('message', ({ context }: WorkerPostMessage) => {
  if (isMemoryDatabase && context.database) {
    // Walkaround: Hydrate the database since the worker does not have access
    // the main thread database instance
    database = InMemoryDatabase.hydrate(context.database);
  }
});

class ActionsProcessor {
  async process(userId: string): Promise<void> {
    const action = await this.getNextUserAction(userId);

    console.log(`Processing actions for user ${userId}`);

    if (!action) {
      // Remove user from hot users
      await database.removeUserFromHotList(userId);
      return;
    }

    const actionInstance = this.getActionInstance(action);

    this.emit(userId, { actionId: action.id, type: 'ACTION:RUNNING' });
    await database.updateActionStatus(userId, action.id, 'RUNNING');
    await actionInstance.execute();

    await database.updateActionStatus(userId, action.id, 'COMPLETED');
    await database.reduceUserCredit(userId, action, 1);
    await database.updatedUser(userId, { locked: false, lastActionExecutedAt: new Date() });

    this.emit(userId, { actionId: action.id, type: 'ACTION:COMPLETED' });
  }

  private async getActionsToSkip(userId: string): Promise<ActionName[]> {
    const userActions = await database.getUserActions(userId);
    const userCredits = await database.getUserCredits(userId);

    const uniqueActionsNames = [...new Set(userActions.map((action) => action.name))];
    return uniqueActionsNames.filter((actionName) => userCredits[actionName] === 0);
  }

  private async getNextUserAction(userId: string): Promise<Action | undefined> {
    const actionsToSkip = await this.getActionsToSkip(userId);
    const userActions = await database.getUserActions(userId);

    return userActions
      .filter((action) => !actionsToSkip.includes(action.name))
      .find((action) => action.status === 'PENDING' || action.status === 'FAILED');
  }

  private getActionInstance(action: Action): BaseAction {
    const actionInstance = actionInstances[action.name];
    assert(actionInstance, `Action ${action.name} not found`);
    return actionInstance;
  }

  private emit<T extends Omit<BaseWorkerMessage, 'context'>>(userId: string, data: T) {
    assert(parentPort, 'Not running as a worker');
    parentPort.postMessage({ userId, data, context: { database: isMemoryDatabase ? database : null } });
  }
}

const processor = new ActionsProcessor();

setInterval(async () => {
  const users = await database.getUsersWithPendingActions();

  users.forEach((user) => {
    const actionTimeElapsed = user.lastActionExecutedAt
      ? timeDifferenceInMilliseconds(user.lastActionExecutedAt, new Date())
      : Infinity;

    const shouldProcessActions = actionTimeElapsed > env.QUEUE_ACTION_EXECUTION_INTERVAL_IN_MS;

    if (shouldProcessActions) {
      database.updatedUser(user.id, { locked: true });
      processor.process(user.id);
    }
  });
}, env.WORKER_TICK_INTERVAL_IN_MS);
