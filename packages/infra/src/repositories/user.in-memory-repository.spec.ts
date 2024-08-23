import { User } from '@repo/domain';
import { UserInMemoryRepository } from './user.in-memory-repository';

describe('UserInMemoryRepository', () => {
  const userId = '3b477874-5111-4507-aab7-268e2e6638a7';
  let repository: UserInMemoryRepository;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
  });

  afterEach(() => {
    repository.database.clear();
  });

  describe('save', () => {
    it('should save a user to the database', () => {
      const user = new User({
        id: userId,
        username: 'testuser',
        lockedQueueAt: null,
        lastActionExecutedAt: null,
      });

      const result = repository.save(user);
      expect(result).toStrictEqual(user);
      expect(repository.database.get(user.id)).toStrictEqual(user);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', () => {
      const user = new User({
        id: userId,
        username: 'testuser',
        lockedQueueAt: null,
        lastActionExecutedAt: null,
      });
      repository.save(user);

      const foundUser = repository.findOne(userId);
      expect(foundUser).toStrictEqual(user);
    });

    it('should return null if no user is found', () => {
      const foundUser = repository.findOne('nonexistent');
      expect(foundUser).toBeNull();
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user by username', () => {
      const user = new User({
        id: userId,
        username: 'testuser',
        lockedQueueAt: null,
        lastActionExecutedAt: null,
      });
      repository.save(user);

      const foundUser = repository.findOneByUsername('testuser');
      expect(foundUser).toStrictEqual(user);
    });

    it('should return null if no user is found by username', () => {
      const foundUser = repository.findOneByUsername('nonexistentuser');
      expect(foundUser).toBeNull();
    });
  });

  describe('find', () => {
    it('should return all users in the database', () => {
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

      repository.save(user1);
      repository.save(user2);

      const users = repository.find();

      expect(users).toHaveLength(2);
      expect(users).toContain(user1);
      expect(users).toContain(user2);
    });

    it('should return an empty array if no users are in the database', () => {
      const users = repository.find();
      expect(users).toHaveLength(0);
    });
  });
});
