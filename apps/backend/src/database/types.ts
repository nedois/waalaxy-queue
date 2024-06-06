import { Action, ActionName, Credit, User } from '@waalaxy/contract';

export interface Database {
  getUser(userId: string): Promise<User | null> | User | null;
  getUsers(): Promise<User[]> | User[];
  registerUser(userId: string): Promise<User> | User;
  updatedUser(userId: string, data: Partial<User>): Promise<User> | User;
  getUserActions(userId: string): Promise<Action[]> | Action[];
  createUserAction(userId: string, action: Action): Promise<Action> | Action;
  getUserCredits(userId: string): Promise<Record<ActionName, Credit>> | Record<ActionName, Credit>;
  saveUserCredits(
    userId: string,
    credits: Record<ActionName, Credit>
  ): Promise<Record<ActionName, Credit>> | Record<ActionName, Credit>;
  updateAction(userId: string, actionId: string, data: Partial<Action>): Promise<Action> | Action;
  reduceUserCredit(
    userId: string,
    action: Action,
    amount: number
  ): Promise<Record<ActionName, Credit>> | Record<ActionName, Credit>;
}
