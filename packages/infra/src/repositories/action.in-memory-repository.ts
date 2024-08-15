import { Action, type ActionRepository } from '@repo/domain';

const actions = new Map<string, Action>();

export class ActionInMemoryRepository implements ActionRepository {
  findByUserId(userId: string): Action[] | Promise<Action[]> {
    return Array.from(actions.values()).filter((action) => action.userId === userId);
  }

  save(action: Action) {
    actions.set(action.id, action);
    return action;
  }
}
