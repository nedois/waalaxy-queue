import { Action, Queue, type ActionRepository } from '@repo/domain';
import { Redis } from 'ioredis';
import assert from 'node:assert';

export class RedisQueue extends Queue {
  constructor(private readonly redis: Redis, private readonly actionRepository: ActionRepository) {
    super();
  }

  private getUserQueueKey(userId: string) {
    return `user:queue:${userId}`;
  }

  async enqueue(action: Action) {
    const queueKey = this.getUserQueueKey(action.userId);
    await this.redis.rpush(queueKey, action.id);
  }

  async remove(action: Action) {
    assert(action.status === 'COMPLETED', `[ Internal error ] Action status must be COMPLETED`);
    const queueKey = this.getUserQueueKey(action.userId);
    await this.redis.lrem(queueKey, 1, action.id);
  }

  async peek(userId: string) {
    const queueKey = this.getUserQueueKey(userId);
    const actionsIds = await this.redis.lrange(queueKey, 0, -1);
    return this.actionRepository.findMany(actionsIds);
  }
}
