import { BaseEntity } from './base.entity';

type NotificationType = 'ACTION_RUNNING' | 'ACTION_COMPLETED' | 'CREDIT_RENEWAL';

/** For simplicity  we are not storing the notification in the database. */
export class Notification<T> extends BaseEntity<Notification<T>> {
  declare type: NotificationType;

  declare message: string;

  declare payload?: T;
}
