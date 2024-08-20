import { Action, Queue, type ActionRepository } from '@repo/domain';
import assert from 'node:assert';

const queues = new Map<string, string[]>();

export class InMemoryQueue extends Queue {
  constructor(private readonly actionRepository: ActionRepository) {
    super();
  }

  enqueue(action: Action) {
    const queue = queues.get(action.userId) ?? [];
    queue.push(action.id);
    queues.set(action.userId, queue);
  }

  remove(action: Action) {
    assert(action.status === 'COMPLETED', `[ Internal Error ] Action status must be COMPLETED`);
    const queue = queues.get(action.userId) ?? [];
    const index = queue.indexOf(action.id);
    if (index !== -1) {
      queue.splice(index, 1);
    }
  }

  peek(userId: string) {
    const actionIds = queues.get(userId) ?? [];
    return this.actionRepository.findMany(actionIds);
  }
}
