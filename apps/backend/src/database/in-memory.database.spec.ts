import type { Credit, Action, ActionName } from '@waalaxy/contract';
import { uuid } from '../utils';
import { InMemoryDatabase } from './in-memory.database';

describe('InMemoryDatabase', () => {
  let database: InMemoryDatabase;

  beforeEach(() => {
    database = new InMemoryDatabase();
  });

  it('shoould return empty array if no actions exists for user', () => {
    const userId = 'user-1';
    const actions = database.getUserActions(userId);
    expect(actions).toEqual([]);
  });

  it('should add and retrieve the user actions', () => {
    const userId = 'user-1';

    const action: Action = {
      id: uuid(),
      name: 'A',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    database.createUserAction(userId, action);

    const actions = database.getUserActions(userId);
    expect(actions).toEqual([action]);
  });

  it('should renew user actions credit', () => {
    const userId = 'user-1';

    const credits: Record<ActionName, Credit> = {
      A: { amount: 1 },
      B: { amount: 2 },
      C: { amount: 3 },
    };

    database.renewUserActionsCredit(userId, credits);

    const userCredits = database.getUserActionsCredit(userId);

    expect(userCredits).toEqual({
      A: { amount: 1 },
      B: { amount: 2 },
      C: { amount: 3 },
    });
  });
});
