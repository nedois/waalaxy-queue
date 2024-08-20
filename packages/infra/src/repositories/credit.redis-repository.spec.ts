import { Credit, EntityNotFoundException } from '@repo/domain';
import { Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ZodError } from 'zod';
import { CreditRedisRepository } from './credit.redis-repository';

describe('CreditRedisRepository', () => {
  const userId = '4310a855-19b2-4af7-815e-019cfa5c31d1';
  let redisMock: Redis;
  let repository: CreditRedisRepository;

  beforeEach(() => {
    redisMock = new RedisMock();
    repository = new CreditRedisRepository(redisMock);
  });

  afterEach(async () => {
    await redisMock.flushall();
  });

  describe('save', () => {
    it('should save a credit and associate it with the user', async () => {
      const credit1 = new Credit({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        amount: 100,
        actionName: 'A',
      });

      const result = await repository.save(credit1);
      expect(result).toEqual(credit1);

      const userCreditsKey = CreditRedisRepository.getUserCreditsKey(userId);
      const credits = await redisMock.hgetall(userCreditsKey);
      const savedCredit = credits[credit1.actionName];
      expect(credits).toBeTruthy();
      expect(savedCredit).toEqual(JSON.stringify(credit1));
      expect(CreditRedisRepository.parse(savedCredit)).toEqual(credit1);
    });
  });

  describe('findByUserId', () => {
    it('should return credits for a given userId', async () => {
      const credit1 = new Credit({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        amount: 100,
        actionName: 'A',
      });
      const credit2 = new Credit({
        id: '4310a855-19b2-4af7-815e-019cfa5c31d1',
        userId,
        amount: 200,
        actionName: 'B',
      });

      await repository.save(credit1);
      await repository.save(credit2);

      const result = await repository.findByUserId(userId);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual(credit1);
      expect(result).toContainEqual(credit2);
    });

    it('should return an empty array if no actions are found', async () => {
      const result = await repository.findByUserId(userId);
      expect(result).toEqual([]);
    });
  });

  describe('saveMany', () => {
    it('should save multiple credits', async () => {
      const credit1 = new Credit({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        amount: 100,
        actionName: 'A',
      });
      const credit2 = new Credit({
        id: '82dc2770-4f9c-48cf-ab1a-e1ef3a4db324',
        userId,
        amount: 200,
        actionName: 'B',
      });

      const result = await repository.saveMany([credit1, credit2]);
      expect(result).toHaveLength(2);

      const credits = await repository.findByUserId(userId);
      expect(credits).toContainEqual(credit1);
      expect(credits).toContainEqual(credit2);
    });
  });

  describe('findOneByUserIdAndActionName', () => {
    it('should return the credit for a given userId and actionName', async () => {
      const credit1 = new Credit({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        amount: 100,
        actionName: 'A',
      });
      await repository.save(credit1);

      const result = await repository.findOneByUserIdAndActionName(userId, 'A');
      expect(result).toEqual(credit1);
    });

    it('should throw an error if the credit is not found', () => {
      expect(async () => {
        await repository.findOneByUserIdAndActionName(userId, 'B');
      }).rejects.toThrow(new EntityNotFoundException(Credit, 'B'));
    });
  });

  describe('parse', () => {
    it('should correctly parse a valid JSON string into a Credit', () => {
      const data = JSON.stringify({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        amount: 100,
        actionName: 'A',
      } satisfies Credit);
      const result = CreditRedisRepository.parse(data);

      expect(result).toBeInstanceOf(Credit);
      expect(result.id).toBe('3b477874-5111-4507-aab7-268e2e6638a7');
      expect(result.userId).toBe(userId);
      expect(result.amount).toBe(100);
      expect(result.actionName).toBe('A');
    });

    it('should throw an error if the JSON string is invalid', () => {
      const invalidData = JSON.stringify({});
      expect(() => CreditRedisRepository.parse(invalidData)).toThrow(ZodError);
    });
  });
});
