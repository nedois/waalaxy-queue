import { User } from '@repo/domain';
import { Redis } from 'ioredis';
import RedisMock from 'ioredis-mock';
import { ZodError } from 'zod';
import { UserRedisRepository } from './user.redis-repository';

describe('UserRedisRepository', () => {
  const userId = '3b477874-5111-4507-aab7-268e2e6638a7';
  let redisMock: Redis;
  let repository: UserRedisRepository;

  beforeEach(() => {
    redisMock = new RedisMock();
    repository = new UserRedisRepository(redisMock);
  });

  afterEach(async () => {
    await redisMock.flushall();
  });

  describe('save', () => {
    it('should save a user data in Redis', async () => {
      const user = new User({
        id: userId,
        username: 'testuser',
        lockedQueueAt: null,
        lastActionExecutedAt: null,
      });

      const result = await repository.save(user);
      expect(result).toEqual(user);

      const userKey = UserRedisRepository.getUserKey(user.id);
      const usernameKey = UserRedisRepository.getUsernameKey(user.username);

      const userData = await redisMock.get(userKey);
      expect(userData).toEqual(
        JSON.stringify({
          id: user.id,
          username: user.username,
          lockedQueueAt: user.lockedQueueAt,
          lastActionExecutedAt: user.lastActionExecutedAt,
        })
      );

      const usernameData = await redisMock.get(usernameKey);
      expect(usernameData).toEqual(user.id);

      const keys = await redisMock.keys(UserRedisRepository.getUserKey('*'));
      expect(keys).toContain(userKey);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = new User({
        id: userId,
        username: 'testuser',
        lockedQueueAt: null,
        lastActionExecutedAt: null,
      });
      await repository.save(user);

      const result = await repository.findOne(userId);
      expect(result).toBe(user);
    });

    it('should return null if no user is found', async () => {
      const result = await repository.findOne('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user by username', async () => {
      const user = new User({
        id: userId,
        username: 'testuser',
        lockedQueueAt: null,
        lastActionExecutedAt: null,
      });
      await repository.save(user);

      const result = await repository.findOneByUsername('testuser');
      expect(result).toStrictEqual(user);
    });

    it('should return null if no user is found by username', async () => {
      const result = await repository.findOneByUsername('nonexistentuser');
      expect(result).toBeNull();
    });
  });

  describe('find', () => {
    it('should return all users in the database', async () => {
      const user1 = new User({
        id: userId,
        username: 'testuser',
        lockedQueueAt: null,
        lastActionExecutedAt: null,
      });
      const user2 = new User({
        id: 'user2',
        username: 'anotheruser',
        lockedQueueAt: null,
        lastActionExecutedAt: null,
      });

      await repository.save(user1);
      await repository.save(user2);

      const users = await repository.find();

      expect(users).toHaveLength(2);
      expect(users).toContainEqual(user1);
      expect(users).toContainEqual(user2);
    });

    it('should return an empty array if no users are in the database', async () => {
      const users = await repository.find();
      expect(users).toHaveLength(0);
    });
  });

  describe('parse', () => {
    it('should correctly parse a valid JSON string into an User', () => {
      const data = JSON.stringify({
        id: userId,
        username: 'testuser',
        lockedQueueAt: new Date('2021-01-01T00:00:00Z'),
        lastActionExecutedAt: null,
      } satisfies User);
      const result = UserRedisRepository.parse(data);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(userId);
      expect(result.username).toBe('testuser');
      expect(result.lockedQueueAt).toBeInstanceOf(Date);
      expect(result.lastActionExecutedAt).toBeNull();
    });

    it('should throw an error if the JSON string is invalid', () => {
      const invalidData = JSON.stringify({});
      expect(() => UserRedisRepository.parse(invalidData)).toThrow(ZodError);
    });
  });
});
