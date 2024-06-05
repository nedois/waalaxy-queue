import assert from 'node:assert';
import { Credit, Action, ActionStatus } from '@waalaxy/contract';

import type { Database, User } from './types';
import { Worker } from '../actions/actions.worker';
import { actionInstances } from '../actions/actions.handlers';

export class InMemoryDatabase implements Database {
  /** Store user credits in userId: Record<actionName, Credit> key-value map */
  private readonly credits = new Map<string, Record<string, Credit>>();

  /** Store user actions in userId: Action[] key-value map */
  private readonly actions = new Map<string, Action[]>();

  /** Store users info */
  private readonly users = new Map<string, User>();

  getUserActions(userId: string): Action[] {
    return this.actions.get(userId) ?? [];
  }

  getUsersWithPendingActions(): User[] {
    return Array.from(this.actions.keys()).map((userId) => {
      const user = this.users.get(userId);
      assert(user, `User ${userId} not found`);
      return user;
    });
  }

  createUserAction(userId: string, action: Action): Action {
    const userActions = this.actions.get(userId) ?? [];
    userActions.push(action);
    this.actions.set(userId, userActions);

    return action;
  }

  getUserActionsCredits(userId: string): Record<string, Credit> {
    let userCredits = this.credits.get(userId);

    if (!userCredits) {
      // Walkaround: Add default credits to the user, normally done in sign up process
      userCredits = {};
      Object.entries(actionInstances).forEach(([actionName, action]) => {
        userCredits![actionName] = { amount: action.generateNewCredit() };
      });
    }

    return userCredits;
  }

  renewUserActionsCredit(userId: string, credits: Record<string, Credit>): Record<string, Credit> {
    const userCredits = this.credits.get(userId);
    assert(userCredits, `User ${userId} has no credits`);

    Object.entries(credits).forEach(([actionName, credit]) => {
      userCredits[actionName] = credit;
    });

    this.credits.set(userId, userCredits);

    return userCredits;
  }

  registerUser(userId: string): User {
    const existingUser = this.users.get(userId);

    if (existingUser) {
      return existingUser;
    }

    const user = { id: userId, lastActionExecutedAt: null, locked: false };
    this.users.set(userId, user);

    return user;
  }

  updatedUser(userId: string, data: Partial<User>): User {
    const user = this.users.get(userId);
    assert(user, `User ${userId} not found`);

    Object.assign(user, data);
    this.users.set(userId, user);

    return user;
  }

  updateActionStatus(actionId: string, status: ActionStatus): Action {
    let foundedUserId = '';

    const actionIndex = Array.from(this.actions.entries())
      .flat(0)
      .findIndex(([userId, actions]) => {
        foundedUserId = userId;
        return actions.find((action) => action.id === actionId);
      });

    const userActions = this.actions.get(foundedUserId);
    assert(userActions, `Action ${actionId} not found`);

    userActions[actionIndex].status = status;
    userActions[actionIndex].updatedAt = new Date();

    this.actions.set(foundedUserId, userActions);

    return userActions[actionIndex];
  }

  reset() {
    this.credits.clear();
    this.actions.clear();
  }

  static hydrate(database: Database) {
    return Object.assign(new InMemoryDatabase(), database);
  }
}

let database = new InMemoryDatabase();

const worker = Worker.getInstance();

worker.subscribe((message) => {
  database = InMemoryDatabase.hydrate(message.context.database);
});

export { database };
