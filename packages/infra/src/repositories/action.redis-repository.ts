import { Action, type ActionRepository } from '@repo/domain';
import { z } from 'zod';
import { BaseRedisRepository } from './base.redis-repository';

export class ActionRedisRepository extends BaseRedisRepository implements ActionRepository {
  private getUserActionsKey(userId: string) {
    return `user:actions:${userId}`;
  }

  private getActionsKey() {
    return 'actions';
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
    const actionsIds = await this.redis.smembers(this.getUserActionsKey(userId));
    return this.findMany(actionsIds);
  }

  async findMany(actionIds: string[]) {
    if (!actionIds.length) {
      return [];
    }

    const actions = await this.redis.hmget(this.getActionsKey(), ...actionIds);
    return actions.map(ActionRedisRepository.parse);
  }

  async save(action: Action) {
    action.updatedAt = new Date();

    const data = JSON.stringify(action);

    await Promise.all([
      this.redis.hset(this.getActionsKey(), action.id, data),
      this.redis.sadd(this.getUserActionsKey(action.userId), action.id),
    ]);

    return action;
  }
}
