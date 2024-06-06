import assert from 'node:assert';
import { Credit, Action, User, ActionName } from '@waalaxy/contract';

import type { Database } from './types';
import { actionInstances } from '../actions/actions.handlers';

export class InMemoryDatabase implements Database {
  /** Store user credits in userId: Record<actionName, Credit> key-value map */
  private readonly credits = new Map<string, Record<string, Credit>>();

  /** Store user actions in userId: Action[] key-value map */
  private readonly actions = new Map<string, Action[]>();

  /** Store users info */
  private readonly users = new Map<string, User>();

  getUser(userId: string): User | null {
    return this.users.get(userId) ?? null;
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserActions(userId: string): Action[] {
    return this.actions.get(userId) ?? [];
  }

  createUserAction(userId: string, action: Action): Action {
    const userActions = this.actions.get(userId) ?? [];
    userActions.push(action);
    this.actions.set(userId, userActions);

    return action;
  }

  getUserCredits(userId: string): Record<string, Credit> {
    const userCredits = this.credits.get(userId);
    assert(userCredits, `User ${userId} has no credits`);
    return userCredits;
  }

  saveUserCredits(userId: string, credits: Record<string, Credit>): Record<string, Credit> {
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

    const userCredits = Object.entries(actionInstances).reduce((credits, [actionName, action]) => {
      credits[actionName] = action.generateNewCredit();
      return credits;
    }, {} as Record<ActionName, Credit>);

    this.credits.set(userId, userCredits);

    return user;
  }

  updatedUser(userId: string, data: Partial<User>): User {
    const user = this.users.get(userId);
    assert(user, `User ${userId} not found`);

    Object.assign(user, data);
    this.users.set(userId, user);

    return user;
  }

  updateAction(userId: string, actionId: string, data: Partial<Action>): Action {
    let foundedUserId = '';

    const actionIndex = Array.from(this.actions.values())
      .flat(0)
      .findIndex((actions) => {
        foundedUserId = userId;
        return actions.find((action) => action.id === actionId);
      });

    const userActions = this.actions.get(foundedUserId);
    assert(userActions, `Action ${actionId} not found`);

    Object.assign(userActions[actionIndex], data);
    userActions[actionIndex].updatedAt = new Date();

    this.actions.set(foundedUserId, userActions);

    return userActions[actionIndex];
  }

  reduceUserCredit(userId: string, action: Action, amount: number): Record<ActionName, Credit> {
    const userCredits = this.credits.get(userId);
    assert(userCredits, `User ${userId} has no credits`);

    userCredits[action.name] = userCredits[action.name] - amount;
    this.saveUserCredits(userId, userCredits);

    return userCredits;
  }

  reset() {
    this.credits.clear();
    this.actions.clear();
    this.users.clear();
  }

  static hydrate(database: Database) {
    return Object.assign(new InMemoryDatabase(), database);
  }
}
