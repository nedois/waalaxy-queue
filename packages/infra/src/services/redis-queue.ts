import { Action, Queue } from '@repo/domain';
import { Redis } from 'ioredis';
import { ActionRedisRepository } from '../repositories';

export class RedisQueue extends Queue {
  constructor(private readonly redis: Redis) {
    super();
  }

  private getUserQueueKey(userId: string) {
    return `queue:${userId}`;
  }

  async enqueue(action: Action) {
    const queueKey = this.getUserQueueKey(action.userId);
    const data = JSON.stringify(action);

    await this.redis.rpush(queueKey, data);
  }

  async dequeue(userId: string) {
    const queueKey = this.getUserQueueKey(userId);
    await this.redis.lpop(queueKey);
  }

  async peek(userId: string) {
    const queueKey = this.getUserQueueKey(userId);
    const data = await this.redis.lrange(queueKey, 0, -1);

    return data.map(ActionRedisRepository.parse);
  }
}
