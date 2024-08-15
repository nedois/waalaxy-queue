import { Action } from '../entities';
import type { ActionRepository } from '../repositories';
import type { UseCase } from './usecase';

type Input = {
  userId: string;
};

type Output = Action[];

export class GetUserActionsUseCase implements UseCase<Input, Output> {
  constructor(private readonly actionRepository: ActionRepository) {}

  async execute(input: Input): Promise<Output> {
    return this.actionRepository.findByUserId(input.userId);
  }
}
