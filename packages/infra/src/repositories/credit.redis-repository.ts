import { Action, ActionName, Credit, type CreditRepository } from '@repo/domain';
import assert from 'node:assert';
import { z } from 'zod';
import { BaseRedisRepository } from './base.redis-repository';

export class CreditRedisRepository extends BaseRedisRepository implements CreditRepository {
  private getUserCreditsKey(userId: string) {
    return `user:credits:${userId}`;
  }

  private parseCredit(data: string): Credit {
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
    const data = await this.redis.hgetall(this.getUserCreditsKey(userId));
    return Object.values(data).map(this.parseCredit);
  }

  async findOneByUserIdAndActionName(userId: string, actionName: ActionName) {
    const data = await this.redis.hget(this.getUserCreditsKey(userId), actionName);
    assert(data, '[ Internal Error ] Credit not found');

    return this.parseCredit(data);
  }

  async save(credit: Credit) {
    await this.redis.hset(this.getUserCreditsKey(credit.userId), credit.actionName, JSON.stringify(credit));
    return credit;
  }

  async saveMany(credits: Credit[]) {
    const { userId } = credits[0];

    const creditsRecord = credits.reduce(
      (acc, credit) => ({ ...acc, [credit.actionName]: JSON.stringify(credit) }),
      {} as Record<ActionName, string>
    );

    await this.redis.hset(this.getUserCreditsKey(userId), creditsRecord);

    return credits;
  }
}
