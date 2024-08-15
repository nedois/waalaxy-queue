import { Credit } from '../entities';
import type { CreditRepository } from '../repositories';
import type { UseCase } from './usecase';

type Input = {
  userId: string;
};

type Output = Credit[];

export class GetUserCreditsUseCase implements UseCase<Input, Output> {
  constructor(private readonly creditRepository: CreditRepository) {}

  async execute(input: Input): Promise<Output> {
    return this.creditRepository.findByUserId(input.userId);
  }
}
