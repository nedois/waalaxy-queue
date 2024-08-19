import { Action, EntityNotFoundException, type ActionRepository } from '@repo/domain';
import assert from 'node:assert';

const database = new Map<string, Action>();

export class ActionInMemoryRepository implements ActionRepository {
  findByUserId(userId: string): Action[] | Promise<Action[]> {
    return Array.from(database.values()).filter((action) => action.userId === userId);
  }

  findMany(actionIds: string[]) {
    return actionIds.map((actionId) => {
      const action = database.get(actionId);
      assert(action, new EntityNotFoundException(Action, actionId));
      return action;
    });
  }

  save(action: Action) {
    database.set(action.id, action);
    return action;
  }
}
