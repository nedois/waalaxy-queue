import { ActionName } from './action.entity';
import { BaseEntity } from './base.entity';

export class Credit extends BaseEntity<Credit> {
  declare actionName: ActionName;

  declare userId: string;

  declare amount: number;
}
