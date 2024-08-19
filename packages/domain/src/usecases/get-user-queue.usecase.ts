import { Action } from '../entities';
import { QueueProcessor } from '../services';
import type { UseCase } from './usecase';

type Input = {
  userId: string;
};

type Output = Action[];

export class GetUserQueueUseCase implements UseCase<Input, Output> {
  constructor(private readonly queueProcessor: QueueProcessor) {}

  async execute(input: Input): Promise<Output> {
    return this.queueProcessor.getUserQueue(input.userId);
  }
}
