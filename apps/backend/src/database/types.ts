import { Action, ActionName, ActionStatus, Credit } from '@waalaxy/contract';

export interface User {
  id: string;
  lastActionExecutedAt: Date | null;
  locked: boolean;
}

export interface Database {
  registerUser(userId: string): Promise<User> | User;
  updatedUser(userId: string, data: Partial<User>): Promise<User> | User;
  getUsersWithPendingActions(): Promise<User> | User[];
  getUserActions(userId: string): Promise<Action[]> | Action[];
  createUserAction(userId: string, action: Action): Promise<Action> | Action;
  getUserActionsCredits(userId: string): Promise<Record<ActionName, Credit>> | Record<ActionName, Credit>;
  renewUserActionsCredit(
    userId: string,
    credits: Record<ActionName, Credit>
  ): Promise<Record<ActionName, Credit>> | Record<ActionName, Credit>;
  updateActionStatus(actionId: string, status: ActionStatus): Promise<Action> | Action;
}
