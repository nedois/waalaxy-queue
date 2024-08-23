import { Action, InvalidActionStatusException, Queue, type ActionRepository } from '@repo/domain';
import { Redis } from 'ioredis';
import assert from 'node:assert';

export class RedisQueue extends Queue {
  constructor(private readonly redis: Redis, private readonly actionRepository: ActionRepository) {
    super();
  }

  static getUserQueueKey(userId: string) {
    return `user:queue:${userId}`;
  }

  async enqueue(action: Action) {
    assert(action.status === 'PENDING', new InvalidActionStatusException(action.status, 'PENDING'));
    const queueKey = RedisQueue.getUserQueueKey(action.userId);
    await this.redis.rpush(queueKey, action.id);
  }

  async remove(action: Action) {
    assert(action.status === 'COMPLETED', new InvalidActionStatusException(action.status, 'COMPLETED'));
    const queueKey = RedisQueue.getUserQueueKey(action.userId);
    await this.redis.lrem(queueKey, 1, action.id);
  }

  async peek(userId: string) {
    const queueKey = RedisQueue.getUserQueueKey(userId);
    const actionsIds = await this.redis.lrange(queueKey, 0, -1);
    const actions = await this.actionRepository.findMany(actionsIds);
    return actions.filter((action) => action.status !== 'COMPLETED');
  }
}
