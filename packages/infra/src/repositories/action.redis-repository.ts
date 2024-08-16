import { Action, type ActionRepository } from '@repo/domain';
import { z } from 'zod';
import { BaseRedisRepository } from './base.redis-repository';

export class ActionRedisRepository extends BaseRedisRepository implements ActionRepository {
  private getUserActionsKey(userId: string) {
    return `user:actions:${userId}`;
  }

  static parse(data: string): Action {
    const properties = z
      .object({
        id: z.string().uuid(),
        name: z.enum(Action.allowedNames),
        userId: z.string().uuid(),
        status: z.enum(Action.allowedStatuses),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
        runnedAt: z.coerce.date().nullable(),
      })
      .parse(JSON.parse(data));

    return new Action(properties);
  }

  async findByUserId(userId: string) {
    const data = await this.redis.hgetall(this.getUserActionsKey(userId));
    return Object.values(data).map(ActionRedisRepository.parse);
  }

  async save(action: Action) {
    const actionKey = this.getUserActionsKey(action.userId);
    const data = JSON.stringify(action);

    await this.redis.hset(actionKey, action.id, data);

    return action;
  }
}
