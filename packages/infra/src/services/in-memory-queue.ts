import { Action, InvalidActionStatusException, Queue, UserRepository, type ActionRepository } from '@repo/domain';
import assert from 'node:assert';

const database = new Map<string, string[]>();

export class InMemoryQueue extends Queue {
  public readonly database = database;

  constructor(private readonly actionRepository: ActionRepository, private readonly userRepository: UserRepository) {
    super();
    this.prepareUserQueues();
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

  peek(userId: string) {
    const actionIds = this.database.get(userId) ?? [];
    return this.actionRepository.findMany(actionIds);
  }

  private async prepareUserQueues() {
    const users = await this.userRepository.find();

    users.forEach(async (user) => {
      const actions = await this.actionRepository.findByUserId(user.id);
      const orderedActions = actions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      orderedActions.forEach((action) => this.enqueue(action));
    });
  }
}
