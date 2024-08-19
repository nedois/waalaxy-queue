import { QueueProcessor } from '../../services/queue-processor';

export class QueueProcessorMock extends QueueProcessor {
  prepareUserQueues = jest.fn<Promise<void>, Parameters<QueueProcessor['prepareUserQueues']>>();
}
