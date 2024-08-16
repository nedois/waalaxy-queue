import { Action, Queue } from '@repo/domain';

const queues = new Map<string, Action[]>();

export class InMemoryQueue extends Queue {
  enqueue(action: Action) {
    const queue = queues.get(action.userId) ?? [];
    queue.push(action);
    queues.set(action.userId, queue);
  }

  dequeue(userId: string) {
    const queue = queues.get(userId) ?? [];
    queue.shift();
    queues.set(userId, queue);
  }

  peek(userId: string) {
    return queues.get(userId) ?? [];
  }
}
