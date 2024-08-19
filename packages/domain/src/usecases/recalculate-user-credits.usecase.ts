import { actionHandlers } from '../action-handlers';
import { Credit } from '../entities';
import type { CreditRepository } from '../repositories';
import type { UseCase } from './usecase';

type Input = {
  userId: string;
};

type Output = Credit[];

export class RecalculateUserCreditsUseCase implements UseCase<Input, Output> {
  constructor(private readonly creditRepository: CreditRepository) {}

  async execute(input: Input): Promise<Output> {
    const credits = await this.creditRepository.findByUserId(input.userId);

    const updatedCredits = actionHandlers.map((ActionHandler) => {
      const actionHandler = new ActionHandler();
      const newCreditAmount = actionHandler.generateNewCredit();
      const credit = credits.find((c) => c.actionName === ActionHandler.actionName);

      // Create a new credit if it doesn't exist
      if (!credit) {
        return new Credit({
          id: Credit.generateId(),
          userId: input.userId,
          amount: newCreditAmount,
          actionName: ActionHandler.actionName,
        });
      }

      // Update the existing credit
      credit.amount = newCreditAmount;

      return credit;
    });

    return this.creditRepository.saveMany(updatedCredits);
  }
}
