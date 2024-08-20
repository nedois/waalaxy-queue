import { Credit, EntityNotFoundException } from '@repo/domain';
import { CreditInMemoryRepository } from './credit.in-memory-repository';

describe('CreditInMemoryRepository', () => {
  const userId = '4310a855-19b2-4af7-815e-019cfa5c31d1';
  let repository: CreditInMemoryRepository;

  beforeEach(() => {
    repository = new CreditInMemoryRepository();
  });

  afterEach(() => {
    repository.database.clear();
  });

  describe('save', () => {
    it('should save a credit to the database', () => {
      const credit1 = new Credit({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        amount: 100,
        actionName: 'A',
      });

      const result = repository.save(credit1);
      expect(result).toBe(credit1);
      expect(repository.database.get(credit1.id)).toBe(credit1);
    });
  });

  describe('saveMany', () => {
    it('should save multiple credits to the database', () => {
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

      const result = repository.saveMany([credit1, credit2]);
      expect(result).toHaveLength(2);
      expect(repository.database.get(credit1.id)).toBe(credit1);
      expect(repository.database.get(credit2.id)).toBe(credit2);
    });
  });

  describe('findByUserId', () => {
    it('should return credits for a given userId', () => {
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

      repository.save(credit1);
      repository.save(credit2);

      const result = repository.findByUserId(userId);
      expect(result).toHaveLength(2);
      expect(result).toContain(credit1);
      expect(result).toContain(credit2);
    });

    it('should return an empty array if no credits exist for the userId', () => {
      const result = repository.findByUserId('user2');
      expect(result).toEqual([]);
    });
  });

  describe('findOneByUserIdAndActionName', () => {
    it('should return the credit for a given userId and actionName', () => {
      const credit1 = new Credit({
        id: '3b477874-5111-4507-aab7-268e2e6638a7',
        userId,
        amount: 100,
        actionName: 'A',
      });
      repository.save(credit1);

      const result = repository.findOneByUserIdAndActionName(userId, 'A');
      expect(result).toBe(credit1);
    });

    it('should throw an error if the credit is not found', () => {
      expect(() => {
        repository.findOneByUserIdAndActionName(userId, 'B');
      }).toThrow(new EntityNotFoundException(Credit, 'B'));
    });
  });
});
