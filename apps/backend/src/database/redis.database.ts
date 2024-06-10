import assert from 'node:assert';
import { Redis } from 'ioredis';
import { z } from 'zod';
import { Credit, Action, User, ActionName } from '@waalaxy/contract';

import { env } from '../env';
import { actionInstances } from '../actions/actions.handlers';
import { type Database } from './types';

/* ---------------------------------- FIXME --------------------------------- */
// Walkaround for missing module resolution
const ActionSchema = z.object({
  id: z.string().uuid(),
  name: z.enum(['A', 'B', 'C']),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  runnedAt: z.coerce.date().nullable().optional(),
});

const UserSchema = z.object({
  id: z.string(),
  lastActionExecutedAt: z.coerce.date().nullable(),
  locked: z.boolean(),
});
/* ---------------------------------- FIXME --------------------------------- */

export class RedisDatabase implements Database {
  public readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      db: env.REDIS_DB,
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
    });
  }

  private getActionsKey(userId: string) {
    return `actions:${userId}`;
  }

  private getCreditKey(userId: string) {
    return `credits:${userId}`;
  }

  private getUserKey(userId: string) {
    return `user:${userId}`;
  }

  async getUser(userId: string) {
    return this.redis
      .get(this.getUserKey(userId))
      .then((data) => (data ? JSON.parse(data) : null))
      .then(UserSchema.nullable().parse);
  }

  async getUsers(): Promise<User[]> {
    return this.redis
      .keys(this.getUserKey('*'))
      .then((keys) => this.redis.mget(keys))
      .then((data) =>
        data.map((user) => {
          assert(user, 'User data not found');
          return JSON.parse(user);
        })
      )
      .then(z.array(UserSchema).parse);
  }

  async getUserActions(userId: string): Promise<Action[]> {
    const data = await this.redis.lrange(this.getActionsKey(userId), 0, -1);
    const actions = z.array(ActionSchema).parse(data.map((action) => JSON.parse(action)));
    return actions;
  }

  async createUserAction(userId: string, action: Action): Promise<Action> {
    await this.redis.rpush(this.getActionsKey(userId), JSON.stringify(action));
    return action;
  }

  async getUserCredits(userId: string): Promise<Record<string, Credit>> {
    const data = await this.redis.hgetall(this.getCreditKey(userId));
    const credits = Object.fromEntries(
      Object.entries(data).map(([actionName, amount]) => [actionName, JSON.parse(amount)])
    );
    return credits;
  }

  async saveUserCredits(userId: string, credits: Record<string, Credit>): Promise<Record<string, Credit>> {
    await this.redis.hmset(this.getCreditKey(userId), credits);
    return credits;
  }

  async registerUser(userId: string): Promise<User> {
    const existingUser = await this.getUser(userId);

    if (existingUser) {
      return existingUser;
    }

    const user = { id: userId, lastActionExecutedAt: null, locked: false };
    await this.redis.set(`user:${userId}`, JSON.stringify(user));

    const userCredits = Object.entries(actionInstances).reduce((credits, [actionName, action]) => {
      credits[actionName] = action.generateNewCredit();
      return credits;
    }, {} as Record<ActionName, Credit>);

    await this.saveUserCredits(user.id, userCredits);

    return user;
  }

  async updatedUser(userId: string, data: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    assert(user, `User ${userId} not found`);

    Object.assign(user, data);
    await this.redis.set(`user:${userId}`, JSON.stringify(user));

    return user;
  }

  async updateAction(userId: string, actionId: string, data: Partial<Action>): Promise<Action> {
    const actions = await this.getUserActions(userId);
    const action = actions.find((a) => a.id === actionId);
    assert(action, `Action ${actionId} not found`);

    Object.assign(action, data);
    await this.redis.lset(this.getActionsKey(userId), actions.indexOf(action), JSON.stringify(action));

    return action;
  }

  async reduceUserCredit(userId: string, action: Action, amount: number): Promise<Record<ActionName, Credit>> {
    const userCredits = await this.getUserCredits(userId);
    userCredits[action.name] = userCredits[action.name] - amount;
    await this.saveUserCredits(userId, userCredits);
    return userCredits;
  }

  async reset() {
    await this.redis.flushdb();
  }
}
