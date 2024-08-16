import { QueueProcessor } from '@repo/domain';

export class RedisQueueProcessor extends QueueProcessor {
  prepareUserQueues() {
    // Do nothing, queues are stored in Redis
  }
}
