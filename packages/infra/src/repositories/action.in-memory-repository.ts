import { Action, EntityNotFoundException, type ActionRepository } from '@repo/domain';
import assert from 'node:assert';

const database = new Map<string, Action>();

export class ActionInMemoryRepository implements ActionRepository {
  public readonly database = database;

  findByUserId(userId: string): Action[] | Promise<Action[]> {
    return Array.from(this.database.values())
      .filter((action) => action.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  findMany(actionIds: string[]) {
    const actions = actionIds.map((actionId) => {
      const action = this.database.get(actionId);
      assert(action, new EntityNotFoundException(Action, actionId));
      return action;
    });

    return actions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  save(action: Action) {
    action.updatedAt = new Date();
    this.database.set(action.id, action);
    return action;
  }
}
