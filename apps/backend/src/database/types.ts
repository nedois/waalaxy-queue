import { Action, ActionName, ActionStatus, Credit, User } from '@waalaxy/contract';

export interface Database {
  registerUser(userId: string): Promise<User> | User;
  updatedUser(userId: string, data: Partial<User>): Promise<User> | User;
  addUserToHotList(userId: string): Promise<void> | void;
  removeUserFromHotList(userId: string): Promise<void> | void;
  getUsersWithPendingActions(): Promise<User[]> | User[];
  getUserActions(userId: string): Promise<Action[]> | Action[];
  createUserAction(userId: string, action: Action): Promise<Action> | Action;
  getUserCredits(userId: string): Promise<Record<ActionName, Credit>> | Record<ActionName, Credit>;
  saveUserCredits(
    userId: string,
    credits: Record<ActionName, Credit>
  ): Promise<Record<ActionName, Credit>> | Record<ActionName, Credit>;
  updateActionStatus(userId: string, actionId: string, status: ActionStatus): Promise<Action> | Action;
  reduceUserCredit(
    userId: string,
    action: Action,
    amount: number
  ): Promise<Record<ActionName, Credit>> | Record<ActionName, Credit>;
}
