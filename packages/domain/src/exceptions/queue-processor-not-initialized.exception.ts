import { BaseException } from './base.exception';

export class QueueProcessorNotInitializedException extends BaseException {
  public readonly code = 'QUEUE_PROCESSOR_NOT_INITIALIZED';

  public readonly statusCode = 500;

  constructor() {
    super('Queue processor is not initialized');
  }
}
