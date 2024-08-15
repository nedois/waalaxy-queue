import { Action } from '../entities';

export interface ActionRepository {
  findByUserId(userId: string): Promise<Action[]> | Action[];
  save(action: Action): Promise<Action> | Action;
}
