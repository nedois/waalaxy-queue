import { BaseEntity } from './base.entity';

export class Action extends BaseEntity<Action> {
  static allowedStatuses = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'] as const;

  static allowedNames = ['A', 'B', 'C'] as const;

  declare name: ActionName;

  declare userId: string;

  declare status: ActionStatus;

  declare createdAt: Date;

  declare updatedAt: Date;

  declare runnedAt: Date | null;
}

export type ActionStatus = (typeof Action.allowedStatuses)[number];

export type ActionName = (typeof Action.allowedNames)[number];
