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

  it('should retrieve a user', () => {
    const user = database.getUser(USER_ID);
    expect(user).not.toBeNull();
    expect(user?.id).toBe(USER_ID);
  });

  it('should return null if user does not exist', () => {
    const user = database.getUser('George');
    expect(user).toBeNull();
  });

  it('should register a user with valid credits', () => {
    database.registerUser('George');

    const user = database.getUser('George');

    expect(user).not.toBeNull();
    expect(user?.id).toBe('George');

    const credits = database.getUserCredits('George');
    expect(credits).not.toBeNull();
    expect(credits).toHaveProperty('A');
    expect(credits).toHaveProperty('B');
    expect(credits).toHaveProperty('C');
  });

  it('should return empty array if no actions exists for user', () => {
    const actions = database.getUserActions(USER_ID);
    expect(actions).toEqual([]);
  });

  it('should retrieve all users', () => {
    const john = database.getUser(USER_ID);
    expect(database.getUsers()).toEqual([john]);

    const george = database.registerUser('George');
    expect(database.getUsers()).toEqual([john, george]);
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
    const credits: Record<ActionName, Credit> = { A: 1, B: 2, C: 3 };
    database.saveUserCredits(USER_ID, credits);
    const userCredits = database.getUserCredits(USER_ID);

    expect(userCredits).toEqual({ A: 1, B: 2, C: 3 });
  });
});
