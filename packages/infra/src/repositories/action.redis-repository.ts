import { Action, type ActionRepository } from '@repo/domain';
import { z } from 'zod';
import { BaseRedisRepository } from './base.redis-repository';

export class ActionRedisRepository extends BaseRedisRepository implements ActionRepository {
  private getUserActionsKey(userId: string) {
    return `user:actions:${userId}`;
  }

  private parseAction(data: string): Action {
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
    const data = await this.redis.lrange(this.getUserActionsKey(userId), 0, -1);
    return data.map(this.parseAction);
  }

  async save(action: Action) {
    const actions = await this.findByUserId(action.userId);
    const actionIdx = actions.indexOf(action);

    if (actionIdx === -1) {
      // Create if action does not exist
      await this.redis.rpush(this.getUserActionsKey(action.userId), JSON.stringify(action));
    } else {
      // Update if action exists
      await this.redis.lset(this.getUserActionsKey(action.userId), actionIdx, JSON.stringify(action));
    }

    return action;
  }
}
