import { Action, type ActionRepository } from '@repo/domain';

const database = new Map<string, Action>();

export class ActionInMemoryRepository implements ActionRepository {
  findByUserId(userId: string): Action[] | Promise<Action[]> {
    return Array.from(database.values()).filter((action) => action.userId === userId);
  }

  save(action: Action) {
    database.set(action.id, action);
    return action;
  }
}
