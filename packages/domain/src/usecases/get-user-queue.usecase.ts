import { Action } from '../entities';
import { Queue } from '../services';
import type { UseCase } from './usecase';

type Input = {
  userId: string;
};

type Output = Action[];

export class GetUserQueueUseCase implements UseCase<Input, Output> {
  constructor(private readonly queue: Queue) {}

  async execute(input: Input): Promise<Output> {
    return this.queue.peek(input.userId);
  }
}
