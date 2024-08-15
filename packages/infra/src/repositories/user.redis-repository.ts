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

  private parseUser(data: string): User {
    const properties = z.object({ id: z.string(), username: z.string() }).parse(JSON.parse(data));
    return new User(properties);
  }

  async findOne(id: string) {
    const data = await this.redis.get(this.getUserKey(id));

    if (!data) {
      return null;
    }

    return this.parseUser(data);
  }

  async findOneByUsername(username: string) {
    const userId = await this.redis.get(this.getUsernameKey(username));

    if (!userId) {
      return null;
    }

    return this.findOne(userId);
  }

  async find() {
    const data = await this.redis.keys(this.getUserKey('*')).then((keys) => this.redis.mget(keys));

    // Remove null values and return users
    return (data.filter(Boolean) as string[]).map((user) => this.parseUser(user));
  }

  async save(user: User) {
    await Promise.all([
      this.redis.set(this.getUserKey(user.id), JSON.stringify(user)),
      this.redis.set(this.getUsernameKey(user.username), user.id),
    ]);

    return user;
  }
}
