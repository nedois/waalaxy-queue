import { User, type UserRepository } from '@repo/domain';
import { z } from 'zod';
import { BaseRedisRepository } from './base.redis-repository';

export class UserRedisRepository extends BaseRedisRepository implements UserRepository {
  private getUserKey(id: string) {
    return `user:id:${id}`;
  }

  private getUsernameKey(username: string) {
    return `user:username:${username}`;
  }

  static parse(data: string): User {
    const properties = z
      .object({
        id: z.string(),
        username: z.string(),
        lockedQueueAt: z.coerce.date().nullable(),
        lastActionExecutedAt: z.coerce.date().nullable(),
      })
      .parse(JSON.parse(data));

    return new User(properties);
  }

  async findOne(id: string) {
    const data = await this.redis.get(this.getUserKey(id));

    if (!data) {
      return null;
    }

    return UserRedisRepository.parse(data);
  }

  async findOneByUsername(username: string) {
    const userId = await this.redis.get(this.getUsernameKey(username));

    if (!userId) {
      return null;
    }

    return this.findOne(userId);
  }

  async find() {
    const keys = await this.redis.keys(this.getUserKey('*'));

    if (!keys.length) {
      return [];
    }

    const data = await this.redis.mget(keys);

    // Remove null values and return users
    return (data.filter(Boolean) as string[]).map((user) => UserRedisRepository.parse(user));
  }

  async save(user: User) {
    await Promise.all([
      this.redis.set(this.getUserKey(user.id), JSON.stringify(user)),
      this.redis.set(this.getUsernameKey(user.username), user.id),
    ]);

    return user;
  }
}
