import { BaseEntity } from './base.entity';

export class User extends BaseEntity<User> {
  declare username: string;
}