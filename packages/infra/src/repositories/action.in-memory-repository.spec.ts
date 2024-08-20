import { Action, EntityNotFoundException } from '@repo/domain';
import { ActionInMemoryRepository } from './action.in-memory-repository';

describe('ActionInMemoryRepository', () => {
  const userId = '9b1b4e62-f58d-4650-923b-0dabd6bbb6a9';
  let repository: ActionInMemoryRepository;

  beforeEach(() => {
    repository = new ActionInMemoryRepository();
  });

  afterEach(() => {
    repository.database.clear();
  });

  describe('save', () => {
    it('should save an action to the database', () => {
      const action = new Action({
        userId,
        id: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });
      const result = repository.save(action);

      expect(result).toBe(action);
      expect(repository.database.get(action.id)).toBe(action);
    });
  });

  describe('findByUserId', () => {
    it('should return actions for a given user sorted by createdAt in descending order', async () => {
      const action1 = new Action({
        userId,
        id: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });
      const action2 = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      repository.save(action2);
      repository.save(action1);

      const result = await repository.findByUserId(userId);
      expect(result).toEqual([action2, action1]);
    });

    it('should return an empty array if no actions exist for the userId', async () => {
      const result = await repository.findByUserId('user2');
      expect(result).toHaveLength(0);
    });
  });

  describe('findMany', () => {
    it('should return actions from Redis when provided action IDs', () => {
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
      repository.save(action1);
      repository.save(action2);
      repository.save(action3);

      const result = repository.findMany(actionIds);

      expect(result).toContainEqual(action1);
      expect(result).toContainEqual(action2);
      expect(result).not.toContainEqual(action3);
    });

    it('should return an empty array if no action IDs are provided', () => {
      const action1 = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        name: 'A',
        status: 'PENDING',
        createdAt: new Date('2023-08-01T10:00:00Z'),
        updatedAt: new Date('2023-08-01T10:00:00Z'),
        runnedAt: null,
      });
      repository.save(action1);

      const result = repository.findMany([]);
      expect(result).toEqual([]);
    });

    it('should throw an error if the one of the action was not found', () => {
      const action1 = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        name: 'A',
        status: 'PENDING',
        createdAt: new Date('2023-08-01T10:00:00Z'),
        updatedAt: new Date('2023-08-01T10:00:00Z'),
        runnedAt: null,
      });
      repository.save(action1);

      expect(() => {
        repository.findMany(['3b477874-5111-4507-aab7-268e2e6638a7', '00000000-xxxx-xxxx-xxxx-0000000']);
      }).toThrow(new EntityNotFoundException(Action, '00000000-xxxx-xxxx-xxxx-0000000'));
    });
  });
});
