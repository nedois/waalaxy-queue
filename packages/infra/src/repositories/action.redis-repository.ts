import { Action, EntityNotFoundException, type ActionRepository } from '@repo/domain';
import assert from 'node:assert';
import { z } from 'zod';
import { BaseRedisRepository } from './base.redis-repository';

export class ActionRedisRepository extends BaseRedisRepository implements ActionRepository {
  static getUserActionsKey(userId: string) {
    return `user:actions:${userId}`;
  }

  static getActionKey(action: Action) {
    return action.id;
  }

  static getActionsKey() {
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
    const actionsIds = await this.redis.smembers(ActionRedisRepository.getUserActionsKey(userId));
    const actions = await this.findMany(actionsIds);
    return actions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findMany(actionIds: string[]) {
    if (!actionIds.length) {
      return [];
    }

    const actions = await this.redis.hmget(ActionRedisRepository.getActionsKey(), ...actionIds);

    return actions.map((data, idx) => {
      assert(data, new EntityNotFoundException(Action, actionIds[idx]));
      return ActionRedisRepository.parse(data);
    });
  }

  async save(action: Action) {
    action.updatedAt = new Date();

    const data = JSON.stringify(action);

    await Promise.all([
      this.redis.hset(ActionRedisRepository.getActionsKey(), ActionRedisRepository.getActionKey(action), data),
      this.redis.sadd(
        ActionRedisRepository.getUserActionsKey(action.userId),
        ActionRedisRepository.getActionKey(action)
      ),
    ]);

    return action;
  }
}
