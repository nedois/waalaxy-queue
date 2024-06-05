import { Action, ActionName, Credit } from '@waalaxy/contract';

export interface Database {
  getUserActions(userId: string): Promise<Action[]> | Action[];
  createUserAction(userId: string, action: Action): Promise<Action> | Action;
  getUserActionsCredit(userId: string): Promise<Record<ActionName, Credit>> | Record<ActionName, Credit>;
  renewUserActionsCredit(userId: string, credits: Record<ActionName, Credit>): Promise<Record<ActionName, Credit>> | Record<ActionName, Credit>;
}
