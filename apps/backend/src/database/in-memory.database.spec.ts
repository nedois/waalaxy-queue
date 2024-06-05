import type { Credit, Action, ActionName } from '@waalaxy/contract';
import { uuid } from '../utils';
import { InMemoryDatabase } from './in-memory.database';

const USER_ID = 'John';

describe('InMemoryDatabase', () => {
  let database: InMemoryDatabase;

  beforeEach(() => {
    database = new InMemoryDatabase();
    database.registerUser(USER_ID);
  });

  it('shoould return empty array if no actions exists for user', () => {
    const userId = 'user-1';
    const actions = database.getUserActions(userId);
    expect(actions).toEqual([]);
  });

  it('should add and retrieve the user actions', () => {
    const action: Action = {
      id: uuid(),
      name: 'A',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    database.createUserAction(USER_ID, action);

    const actions = database.getUserActions(USER_ID);
    expect(actions).toEqual([action]);
  });

  it('should renew user actions credit', () => {
    const credits: Record<ActionName, Credit> = {
      A: 1,
      B: 2,
      C: 3,
    };

    database.saveUserCredits(USER_ID, credits);

    const userCredits = database.getUserCredits(USER_ID);

    expect(userCredits).toEqual({
      A: 1,
      B: 2,
      C: 3,
    });
  });
});
