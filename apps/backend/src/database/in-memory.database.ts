import assert from 'node:assert';
import { Credit, Action } from '@waalaxy/contract';

import type { Database } from './types';

export class InMemoryDatabase implements Database {
  /** Store user credits in userId: Record<actionName, Credit> key-value map */
  private readonly credits = new Map<string, Record<string, Credit>>();

  /** Store user actions in userId: Action[] key-value map */
  private readonly actions = new Map<string, Action[]>();

  getUserActions(userId: string): Action[] {
    return this.actions.get(userId) ?? [];
  }

  createUserAction(userId: string, action: Action): Action {
    const userActions = this.actions.get(userId) ?? [];
    userActions.push(action);
    this.actions.set(userId, userActions);

    return action;
  }

  getUserActionsCredit(userId: string): Record<string, Credit> {
    const userCredits = this.credits.get(userId);
    assert(userCredits, `User ${userId} has no credits`);
    return userCredits;
  }

  renewUserActionsCredit(userId: string, credits: Record<string, Credit>): Record<string, Credit> {
    const userCredits = this.credits.get(userId) ?? {};

    Object.entries(credits).forEach(([actionName, credit]) => {
      userCredits[actionName] = credit;
    });

    this.credits.set(userId, userCredits);

    return userCredits;
  }

  reset() {
    this.credits.clear();
    this.actions.clear();
  }
}

export const database = new InMemoryDatabase();
