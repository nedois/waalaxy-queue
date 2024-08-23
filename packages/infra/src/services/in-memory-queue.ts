import { Action, InvalidActionStatusException, Queue, type ActionRepository } from '@repo/domain';
import assert from 'node:assert';

const database = new Map<string, string[]>();

export class InMemoryQueue extends Queue {
  public readonly database = database;

  constructor(private readonly actionRepository: ActionRepository) {
    super();
  }

  enqueue(action: Action) {
    assert(action.status === 'PENDING', new InvalidActionStatusException(action.status, 'PENDING'));
    const queue = this.database.get(action.userId) ?? [];
    queue.push(action.id);
    this.database.set(action.userId, queue);
  }

  remove(action: Action) {
    assert(action.status === 'COMPLETED', new InvalidActionStatusException(action.status, 'COMPLETED'));
    const queue = this.database.get(action.userId) ?? [];
    const index = queue.indexOf(action.id);
    if (index !== -1) {
      queue.splice(index, 1);
    }
  }

  async peek(userId: string) {
    const actionIds = this.database.get(userId) ?? [];
    const actions = await this.actionRepository.findMany(actionIds);
    return actions.filter((action) => action.status !== 'COMPLETED');
  }
}
