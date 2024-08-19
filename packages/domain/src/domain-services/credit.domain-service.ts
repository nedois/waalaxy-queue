import { actionHandlers } from '../action-handlers';
import { Credit } from '../entities';
import type { CreditRepository } from '../repositories';

export class CreditDomainService {
  constructor(private readonly creditRepository: CreditRepository) {}

  async recalculateUserCredits(userId: string): Promise<Credit[]> {
    const credits = await this.creditRepository.findByUserId(userId);

    const updatedCredits = actionHandlers.map((HandlerClass) => {
      const actionHandler = new HandlerClass();
      const newCreditAmount = actionHandler.generateNewCredit();
      const credit = credits.find((c) => c.actionName === HandlerClass.actionName);

      // Create a new credit if it doesn't exist
      if (!credit) {
        return new Credit({
          userId,
          id: Credit.generateId(),
          amount: newCreditAmount,
          actionName: HandlerClass.actionName,
        });
      }

      // Update the existing credit
      credit.amount = newCreditAmount;

      return credit;
    });

    return this.creditRepository.saveMany(updatedCredits);
  }
}
