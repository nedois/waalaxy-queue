import { parentPort } from 'node:worker_threads';
import assert from 'node:assert';
import { Action, type ActionName } from '@waalaxy/contract';

import { env } from '../env';
import { BaseAction } from './base.action';
import { actionInstances } from './actions.handlers';
import { BaseWorkerMessage, WorkerPostMessage } from './actions.worker';
import { InMemoryDatabase } from '../database';
import { timeDifferenceInMilliseconds } from '../utils';

assert(parentPort, 'Not running as a worker');

let database = new InMemoryDatabase();

parentPort.on('message', ({ context }: WorkerPostMessage) => {
  // Walkaround: Hydrate the database since the worker does not have access
  // the main thread database instance
  database = InMemoryDatabase.hydrate(context.database);
});

class ActionsProcessor {
  async process(userId: string): Promise<void> {
    const action = this.getNextUserAction(userId);

    console.log(`Processing actions for user ${userId}`, action);

    if (!action) {
      return;
    }

    const actionInstance = this.getActionInstance(action);

    this.emit(userId, { actionId: action.id, type: 'ACTION:RUNNING' });
    await actionInstance.execute();

    database.updateActionStatus(action.id, 'COMPLETED');
    database.updatedUser(userId, { locked: false, lastActionExecutedAt: new Date() });
    this.emit(userId, { actionId: action.id, type: 'ACTION:COMPLETED' });
  }

  private getActionsToSkip(userId: string): ActionName[] {
    const userActions = database.getUserActions(userId);
    const userCredits = database.getUserActionsCredits(userId);

    const uniqueActionsNames = [...new Set(userActions.map((action) => action.name))];
    return uniqueActionsNames.filter((actionName) => userCredits[actionName].amount === 0);
  }

  private getNextUserAction(userId: string): Action | undefined {
    const actionsToSkip = this.getActionsToSkip(userId);
    const userActions = database.getUserActions(userId);

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
    parentPort.postMessage({ userId, data, context: { database } });
  }
}

const processor = new ActionsProcessor();

setInterval(() => {
  const users = database.getUsersWithPendingActions();

  users.forEach((user) => {
    const actionTimeElapsed = user.lastActionExecutedAt
      ? timeDifferenceInMilliseconds(user.lastActionExecutedAt, new Date())
      : Infinity;

    const shouldProcessActions = actionTimeElapsed > env.QUEUE_ACTION_EXECUTION_INTERVAL_IN_MS && !user.locked;

    if (shouldProcessActions) {
      database.updatedUser(user.id, { locked: true });
      processor.process(user.id);
    }
  });
}, env.WORKER_TICK_INTERVAL_IN_MS);
