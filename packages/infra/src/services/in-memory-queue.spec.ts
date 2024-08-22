import { Action, InvalidActionStatusException } from '@repo/domain';
import { ActionInMemoryRepository, UserInMemoryRepository } from '../repositories';
import { InMemoryQueue } from './in-memory-queue';

describe('InMemoryQueue', () => {
  let inMemoryQueue: InMemoryQueue;
  let actionRepository: ActionInMemoryRepository;
  let userRepository: UserInMemoryRepository;

  beforeEach(() => {
    actionRepository = new ActionInMemoryRepository();
    userRepository = new UserInMemoryRepository();
    inMemoryQueue = new InMemoryQueue(actionRepository, userRepository);
  });

  afterEach(() => {
    inMemoryQueue.database.clear();
    actionRepository.database.clear();
    jest.clearAllMocks();
  });

  describe('enqueue', () => {
    it("should add a valid action to the user's queue", () => {
      const action = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      actionRepository.save(action);
      inMemoryQueue.enqueue(action);

      const queue = inMemoryQueue.peek(action.userId);
      expect(queue).toStrictEqual([action]);
    });

    it('should append and action to the existing queue for the user', () => {
      const action1 = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      const action2 = new Action({
        id: '82dc2770-4f9c-48cf-ab1a-e1ef3a4db324',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'B',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      actionRepository.save(action1);
      actionRepository.save(action2);

      inMemoryQueue.enqueue(action1);
      let queue = inMemoryQueue.peek(action1.userId);
      expect(queue).toHaveLength(1);
      expect(queue).toContain(action1);

      inMemoryQueue.enqueue(action2);
      queue = inMemoryQueue.peek(action1.userId);
      expect(queue).toHaveLength(2);
      expect(queue).toContain(action1);
      expect(queue).toContain(action2);
    });

    it('should throw an error if the action status is not PENDING', () => {
      const action = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      expect(() => inMemoryQueue.enqueue(action)).toThrow(new InvalidActionStatusException(action.status, 'PENDING'));
    });
  });

  describe('remove', () => {
    it('should remove an action from the user queue', () => {
      const action = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      actionRepository.save(action);
      inMemoryQueue.enqueue(action);

      let queue = inMemoryQueue.peek(action.userId);
      expect(queue).toContain(action);

      action.status = 'COMPLETED';
      actionRepository.save(action);
      inMemoryQueue.remove(action);
      queue = inMemoryQueue.peek(action.userId);
      expect(queue).toStrictEqual([]);
    });

    it('should not remove an action if it is not in the queue', () => {
      const action = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      actionRepository.save(action);
      inMemoryQueue.remove(action);

      const queue = inMemoryQueue.peek(action.userId);
      expect(queue).toStrictEqual([]);
    });

    it('should throw an error if the action status is not COMPLETED', () => {
      const action = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      expect(() => inMemoryQueue.remove(action)).toThrow(new InvalidActionStatusException(action.status, 'COMPLETED'));
    });
  });

  describe('peek', () => {
    it('should return an empty array if the user has no actions in the queue', () => {
      const actions = inMemoryQueue.peek('4310a855-19b2-4af7-815e-019cfa5c31d1');
      expect(actions).toStrictEqual([]);
    });

    it('should return the actions in the user queue', () => {
      const action1 = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      const action2 = new Action({
        id: '82dc2770-4f9c-48cf-ab1a-e1ef3a4db324',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'B',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      actionRepository.save(action1);
      actionRepository.save(action2);

      inMemoryQueue.enqueue(action1);
      inMemoryQueue.enqueue(action2);

      const actions = inMemoryQueue.peek(action1.userId);
      expect(actions).toStrictEqual([action1, action2]);
    });
  });
});
