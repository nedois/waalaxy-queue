import { parentPort } from 'node:worker_threads';
import assert from 'node:assert';
import { Action, User, type ActionName } from '@waalaxy/contract';

import { env } from '../env';
import { BaseAction } from './base.action';
import { actionInstances, computeNewCredits } from './actions.handlers';
import { BaseWorkerMessage, WorkerPostMessage } from './actions.worker';
import { InMemoryDatabase } from '../database/in-memory.database';
import { RedisDatabase } from '../database/redis.database';
import { timeDifferenceInMilliseconds } from '../utils';
import { Database } from '../database';

assert(parentPort, 'Scheduler should run inside a worker');

const isMemoryDatabase = env.DB_TYPE === 'memory';

let database = isMemoryDatabase ? new InMemoryDatabase() : new RedisDatabase();

parentPort.on('message', ({ context }: WorkerPostMessage) => {
  if (isMemoryDatabase && context.database) {
    // Walkaround: Hydrate the database since the worker does not have access
    // the main thread database instance
    database = InMemoryDatabase.hydrate(context.database);
  }
});

export class ActionsScheduler {
  private readonly usersTimeout = new Map<string, NodeJS.Timeout>();
  private readonly RENEWAL_CREDITS_INTERVAL = env.CREDITS_RENEWAL_INTERVAL_IN_MS;
  private readonly LOCK_THRESHOLD = 2 * env.QUEUE_EXECUTION_INTERVAL_IN_MS;
  private readonly ACTION_EXECUTION_INTERVAL = env.QUEUE_EXECUTION_INTERVAL_IN_MS;
  private readonly database: Database;

  constructor(customDatabase?: Database) {
    this.database = customDatabase || database;
  }

  async process(userId: string, action: Action): Promise<void> {
    console.log(`Processing action ${action.id} for user ${userId}`);
    this.emit(userId, { actionId: action.id, type: 'ACTION:RUNNING' });

    const actionInstance = this.getActionInstance(action);

    await this.database.updateAction(userId, action.id, { status: 'RUNNING', runnedAt: new Date() });
    await actionInstance.execute();

    await this.onActionCompleted(userId, action);
  }

  private async getActionsToSkip(userId: string): Promise<ActionName[]> {
    const [userActions, userCredits] = await Promise.all([
      this.database.getUserActions(userId),
      this.database.getUserCredits(userId),
    ]);

    const uniqueActionsNames = [...new Set(userActions.map((action) => action.name))];
    return uniqueActionsNames.filter((actionName) => userCredits[actionName] === 0);
  }

  getActionInstance(action: Action): BaseAction {
    const actionInstance = actionInstances[action.name];
    assert(actionInstance, `Action ${action.name} not found`);
    return actionInstance;
  }

  private emit<T extends Omit<BaseWorkerMessage, 'context'>>(userId: string, data: T) {
    assert(parentPort, 'Not running as a worker');
    parentPort.postMessage({ userId, data, context: { database: isMemoryDatabase ? this.database : null } });
  }

  private async getNextUserAction(userId: string): Promise<Action | undefined> {
    const [actionsToSkip, userActions] = await Promise.all([
      this.getActionsToSkip(userId),
      this.database.getUserActions(userId),
    ]);

    return userActions
      .filter((action) => !actionsToSkip.includes(action.name))
      .find((action) => {
        // Actions can be stale if the worker crashes
        // By default, we consider an action stale if it has not been executed
        const isActionStale = action.runnedAt
          ? timeDifferenceInMilliseconds(action.runnedAt, new Date()) > this.LOCK_THRESHOLD
          : true;

        return action.status !== 'COMPLETED' && isActionStale;
      });
  }

  async scheduleNextAction(userId: string) {
    let user = await this.database.getUser(userId);
    assert(user, `User ${userId} not found`);

    user = await this.revalidateUserLock(user);

    // Another worker is already processing the user queue
    if (user.locked) return;

    // Recalculate user credits if necessary
    await this.renewalUserCredits(user);

    const action = await this.getNextUserAction(userId);

    if (!action) {
      return this.clearTimeout(userId);
    }

    // Lock the user to avoid processing workers to execute the same
    // action queue at the same time
    await this.database.updatedUser(userId, { locked: true, lastActionExecutedAt: new Date() });

    const isFirstAction = !this.usersTimeout.has(userId);

    const timeoutId = setTimeout(
      async () => await this.process(userId, action),
      isFirstAction ? 0 : this.ACTION_EXECUTION_INTERVAL
    );
    this.usersTimeout.set(userId, timeoutId);
  }

  private clearTimeout(userId: string) {
    const timeoutId = this.usersTimeout.get(userId);

    if (timeoutId) {
      clearTimeout(timeoutId);
      this.usersTimeout.delete(userId);
    }
  }

  private async revalidateUserLock(user: User) {
    const lastActionTimeElapsed = this.getLastActionTimeElapsed(user);

    /**
     * If the user is locked and the last action was executed more than the threshold
     * we unlock the user to allow the worker to process the next action.
     * This avoid the user queue to be stuck if the worker crashes.
     */
    if (lastActionTimeElapsed > this.LOCK_THRESHOLD && user.locked) {
      return this.database.updatedUser(user.id, { locked: false });
    }

    return user;
  }

  private async renewalUserCredits(user: User) {
    const lastActionTimeElapsed = this.getLastActionTimeElapsed(user);

    if (lastActionTimeElapsed > this.RENEWAL_CREDITS_INTERVAL) {
      const newCredits = computeNewCredits();
      await this.database.saveUserCredits(user.id, newCredits);
    }
  }

  private async onActionCompleted(userId: string, action: Action) {
    await this.database.updateAction(userId, action.id, { status: 'COMPLETED' });
    await this.database.reduceUserCredit(userId, action, 1);
    await this.database.updatedUser(userId, { locked: false });
    this.emit(userId, { actionId: action.id, type: 'ACTION:COMPLETED' });

    await this.scheduleNextAction(userId);
  }

  private getLastActionTimeElapsed(user: User) {
    return user.lastActionExecutedAt ? timeDifferenceInMilliseconds(user.lastActionExecutedAt, new Date()) : Infinity;
  }
}
