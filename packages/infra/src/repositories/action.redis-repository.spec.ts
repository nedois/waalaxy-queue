import { Action, EntityNotFoundException } from '@repo/domain';
import { Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ZodError } from 'zod';
import { ActionRedisRepository } from './action.redis-repository';

describe('ActionRedisRepository', () => {
  const userId = '3b477874-5111-4507-aab7-268e2e6638a7';
  let redisMock: Redis;
  let repository: ActionRedisRepository;

  beforeEach(() => {
    redisMock = new RedisMock();
    repository = new ActionRedisRepository(redisMock);
  });

  afterEach(async () => {
    await redisMock.flushall();
  });

  describe('save', () => {
    it('should save the action in Redis and associate it with the user', async () => {
      const action = new Action({
        userId,
        id: '4k477874-5111-4507-aab7-268e2e6638a7',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      const result = await repository.save(action);
      expect(result).toEqual(action);

      const actionKey = ActionRedisRepository.getActionKey(action);
      const userActionsKey = ActionRedisRepository.getUserActionsKey(action.userId);
      const actionsKey = ActionRedisRepository.getActionsKey();

      const actionData = await redisMock.hget(actionsKey, actionKey);
      expect(actionData).toBeTruthy();

      const userActions = await redisMock.smembers(userActionsKey);
      expect(userActions).toContain(actionKey);

      const parsedAction = JSON.parse(actionData ?? '');
      expect(parsedAction).toEqual({
        id: action.id,
        userId: action.userId,
        name: action.name,
        status: action.status,
        createdAt: action.createdAt.toISOString(),
        updatedAt: action.updatedAt.toISOString(),
        runnedAt: action.runnedAt,
      });
    });
  });

  describe('findByUserId', () => {
    it('should return actions for a given user sorted by createdAt in descending order', async () => {
      const action1 = new Action({
        id: Action.generateId(),
        userId,
        name: 'A',
        status: 'PENDING',
        createdAt: new Date('2023-08-01T10:00:00Z'),
        updatedAt: new Date('2023-08-01T10:00:00Z'),
        runnedAt: null,
      });
      const action2 = new Action({
        id: Action.generateId(),
        userId,
        name: 'B',
        status: 'PENDING',
        createdAt: new Date('2023-08-02T10:00:00Z'),
        updatedAt: new Date('2023-08-02T10:00:00Z'),
        runnedAt: null,
      });

      await repository.save(action1);
      await repository.save(action2);

      const result = await repository.findByUserId(userId);
      expect(result).toEqual([action1, action2]);
    });

    it('should return an empty array if no actions are found', async () => {
      const result = await repository.findByUserId(userId);
      expect(result).toEqual([]);
    });
  });

  describe('findMany', () => {
    it('should return actions from Redis when provided action IDs', async () => {
      const actionIds = ['3b477874-5111-4507-aab7-268e2e6638a7', 'f7030471-fb91-4160-be68-767883ce7326'];
      const action1 = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        name: 'A',
        status: 'PENDING',
        createdAt: new Date('2023-08-01T10:00:00Z'),
        updatedAt: new Date('2023-08-01T10:00:00Z'),
        runnedAt: null,
      });
      const action2 = new Action({
        id: 'f7030471-fb91-4160-be68-767883ce7326',
        userId,
        name: 'B',
        status: 'PENDING',
        createdAt: new Date('2023-08-02T10:00:00Z'),
        updatedAt: new Date('2023-08-02T10:00:00Z'),
        runnedAt: null,
      });
      const action3 = new Action({
        id: '5f3b0b76-c358-471d-aa56-4e60e634e097',
        userId,
        name: 'B',
        status: 'PENDING',
        createdAt: new Date('2023-08-02T10:00:00Z'),
        updatedAt: new Date('2023-08-02T10:00:00Z'),
        runnedAt: null,
      });
      await repository.save(action1);
      await repository.save(action2);
      await repository.save(action3);

      const result = await repository.findMany(actionIds);

      expect(result).toContainEqual(action1);
      expect(result).toContainEqual(action2);
      expect(result).not.toContainEqual(action3);
    });

    it('should return an empty array if no action IDs are provided', async () => {
      const action1 = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        name: 'A',
        status: 'PENDING',
        createdAt: new Date('2023-08-01T10:00:00Z'),
        updatedAt: new Date('2023-08-01T10:00:00Z'),
        runnedAt: null,
      });
      await repository.save(action1);

      const result = await repository.findMany([]);
      expect(result).toEqual([]);
    });

    it('should throw an error if the one of the action was not found', async () => {
      const action1 = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        name: 'A',
        status: 'PENDING',
        createdAt: new Date('2023-08-01T10:00:00Z'),
        updatedAt: new Date('2023-08-01T10:00:00Z'),
        runnedAt: null,
      });
      await repository.save(action1);

      expect(async () => {
        await repository.findMany(['3b477874-5111-4507-aab7-268e2e6638a7', '00000000-xxxx-xxxx-xxxx-0000000']);
      }).rejects.toThrow(new EntityNotFoundException(Action, '00000000-xxxx-xxxx-xxxx-0000000'));
    });
  });

  describe('parse', () => {
    it('should correctly parse a valid JSON string into an Action', () => {
      const data = JSON.stringify({
        id: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        userId,
        name: 'B',
        status: 'PENDING',
        createdAt: new Date('2023-08-01T10:00:00Z'),
        updatedAt: new Date('2023-08-01T10:00:00Z'),
        runnedAt: null,
      } satisfies Action);
      const result = ActionRedisRepository.parse(data);

      expect(result).toBeInstanceOf(Action);
      expect(result.id).toBe('4310a855-19b2-4af7-815e-019cfa5c31d1');
      expect(result.userId).toBe(userId);
      expect(result.name).toBe('B');
      expect(result.status).toBe('PENDING');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.runnedAt).toBeNull();
    });

    it('should throw an error if the JSON string is invalid', () => {
      const invalidData = JSON.stringify({});
      expect(() => ActionRedisRepository.parse(invalidData)).toThrow(ZodError);
    });
  });
});
