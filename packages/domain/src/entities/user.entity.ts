import { BaseEntity } from './base.entity';

export class User extends BaseEntity<User> {
  declare username: string;

  declare lockedQueueAt: Date | null;

  declare lastActionExecutedAt: Date | null;
}
