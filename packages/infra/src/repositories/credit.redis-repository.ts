import { Action, ActionName, Credit, EntityNotFoundException, type CreditRepository } from '@repo/domain';
import assert from 'node:assert';
import { z } from 'zod';
import { BaseRedisRepository } from './base.redis-repository';

export class CreditRedisRepository extends BaseRedisRepository implements CreditRepository {
  static getUserCreditsKey(userId: string) {
    return `user:credits:${userId}`;
  }

  static parse(data: string): Credit {
    const properties = z
      .object({
        id: z.string().uuid(),
        actionName: z.enum(Action.allowedNames),
        userId: z.string().uuid(),
        amount: z.number().min(0),
      })
      .parse(JSON.parse(data));

    return new Credit(properties);
  }

  async findByUserId(userId: string) {
    const data = await this.redis.hgetall(CreditRedisRepository.getUserCreditsKey(userId));
    return Object.values(data).map(CreditRedisRepository.parse);
  }

  async findOneByUserIdAndActionName(userId: string, actionName: ActionName) {
    const data = await this.redis.hget(CreditRedisRepository.getUserCreditsKey(userId), actionName);
    assert(data, new EntityNotFoundException(Credit, actionName));

    return CreditRedisRepository.parse(data);
  }

  async save(credit: Credit) {
    const creditKey = CreditRedisRepository.getUserCreditsKey(credit.userId);
    const data = JSON.stringify(credit);

    await this.redis.hset(creditKey, credit.actionName, data);

    return credit;
  }

  async saveMany(credits: Credit[]) {
    const { userId } = credits[0];

    const creditsRecord = credits.reduce(
      (acc, credit) => ({ ...acc, [credit.actionName]: JSON.stringify(credit) }),
      {} as Record<ActionName, string>
    );

    await this.redis.hset(CreditRedisRepository.getUserCreditsKey(userId), creditsRecord);

    return credits;
  }
}
