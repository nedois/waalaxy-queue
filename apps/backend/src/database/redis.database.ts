import assert from 'node:assert';
import { Redis } from 'ioredis';
import { z } from 'zod';
// import { Credit, Action, ActionStatus, ActionSchema, UserSchema, User, ActionName } from '@waalaxy/contract';

import { env } from '../env';
import { actionInstances } from '../actions/actions.handlers';
import { type Database } from './types';

const CreditSchema = z.number().int().min(0);

type Credit = z.infer<typeof CreditSchema>;

const ActionNameSchema = z.enum(['A', 'B', 'C']);

type ActionName = z.infer<typeof ActionNameSchema>;

const ActionStatusSchema = z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']);

type ActionStatus = z.infer<typeof ActionStatusSchema>;

const ActionSchema = z.object({
  id: z.string().uuid(),
  name: ActionNameSchema,
  status: ActionStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

type Action = z.infer<typeof ActionSchema>;

const UserSchema = z.object({
  id: z.string(),
  lastActionExecutedAt: z.coerce.date().nullable(),
  locked: z.boolean(),
});

type User = z.infer<typeof UserSchema>;

export class RedisDatabase implements Database {
  private readonly redis: Redis;

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

  private getHotUsersKey() {
    return 'hot-users';
  }

  private async getUser(userId: string) {
    return this.redis
      .get(`user:${userId}`)
      .then((data) => (data ? JSON.parse(data) : null))
      .then((data) => UserSchema.nullable().parse(data));
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

  async updateActionStatus(userId: string, actionId: string, status: ActionStatus): Promise<Action> {
    const actions = await this.getUserActions(userId);
    const action = actions.find((a) => a.id === actionId);
    assert(action, `Action ${actionId} not found`);

    action.status = status;
    await this.redis.lset(this.getActionsKey(userId), actions.indexOf(action), JSON.stringify(action));

    return action;
  }

  async addUserToHotList(userId: string) {
    await this.redis.sadd(this.getHotUsersKey(), userId);
  }

  async removeUserFromHotList(userId: string) {
    await this.redis.srem(this.getHotUsersKey(), userId);
  }

  async getUsersWithPendingActions(): Promise<User[]> {
    const userIds = await this.redis.smembers(this.getHotUsersKey());
    const users = await Promise.all(userIds.map((userId) => this.getUser(userId)));
    return z.array(UserSchema).parse(users);
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
