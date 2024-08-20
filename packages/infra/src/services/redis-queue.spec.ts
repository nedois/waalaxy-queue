import { Action, InvalidActionStatusException } from '@repo/domain';
import { Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ActionInMemoryRepository } from '../repositories';
import { RedisQueue } from './redis-queue';

describe('RedisQueue', () => {
  let redisQueue: RedisQueue;
  let redisMock: Redis;
  let actionRepository: ActionInMemoryRepository;

  beforeEach(() => {
    redisMock = new RedisMock();
    actionRepository = new ActionInMemoryRepository();
    redisQueue = new RedisQueue(redisMock, actionRepository);
  });

  afterEach(async () => {
    actionRepository.database.clear();
    await redisMock.flushall();
  });

  describe('enqueue', () => {
    it("should add a valid action to the user's queue", async () => {
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
      await redisQueue.enqueue(action);

      const queue = await redisQueue.peek(action.userId);
      expect(queue).toStrictEqual([action]);
    });

    it('should append and action to the existing queue for the user', async () => {
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

      await redisQueue.enqueue(action1);
      let queue = await redisQueue.peek(action1.userId);
      expect(queue).toHaveLength(1);
      expect(queue).toContain(action1);

      await redisQueue.enqueue(action2);
      queue = await redisQueue.peek(action1.userId);
      expect(queue).toHaveLength(2);
      expect(queue).toContain(action1);
      expect(queue).toContain(action2);
    });

    it('should throw an error if the action status is not PENDING', async () => {
      const action = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      expect(async () => await redisQueue.enqueue(action)).rejects.toThrow(
        new InvalidActionStatusException(action.status, 'PENDING')
      );
    });
  });

  describe('remove', () => {
    it('should remove an action from the user queue', async () => {
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
      await redisQueue.enqueue(action);
      let queue = await redisQueue.peek(action.userId);
      expect(queue).toContain(action);

      action.status = 'COMPLETED';
      actionRepository.save(action);
      await redisQueue.remove(action);
      queue = await redisQueue.peek(action.userId);
      expect(queue).toStrictEqual([]);
    });

    it('should not remove an action if it is not in the queue', async () => {
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
      await redisQueue.remove(action);

      const queue = await redisQueue.peek(action.userId);
      expect(queue).toStrictEqual([]);
    });

    it('should throw an error if the action status is not COMPLETED', async () => {
      const action = new Action({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      });

      expect(async () => await redisQueue.remove(action)).rejects.toThrow(
        new InvalidActionStatusException(action.status, 'COMPLETED')
      );
    });
  });

  describe('peek', () => {
    it('should return an empty array if the user has no actions in the queue', async () => {
      const actions = await redisQueue.peek('4310a855-19b2-4af7-815e-019cfa5c31d1');
      expect(actions).toStrictEqual([]);
    });

    it('should return the actions in the user queue', async () => {
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

      await redisQueue.enqueue(action1);
      await redisQueue.enqueue(action2);

      const actions = await redisQueue.peek(action1.userId);
      expect(actions).toStrictEqual([action1, action2]);
    });
  });
});
