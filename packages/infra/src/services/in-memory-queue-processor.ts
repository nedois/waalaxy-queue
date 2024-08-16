import { QueueProcessor } from '@repo/domain';

export class InMemoryQueueProcessor extends QueueProcessor {
  async prepareUserQueues() {
    const users = await this.userRepository.find();

    users.forEach(async (user) => {
      const actions = await this.actionRepository.findByUserId(user.id);
      const orderedActions = actions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      orderedActions.forEach((action) => this.queue.enqueue(action));
    });
  }
}
