import { QueueProcessor } from '../services';
import type { UseCase } from './usecase';

type Output = ReturnType<QueueProcessor['getSettings']>;

export class GetQueueSettingsUseCase implements UseCase<void, Output> {
  constructor(private readonly queueProcessor: QueueProcessor) {}

  async execute(): Promise<Output> {
    return this.queueProcessor.getSettings();
  }
}
