import { actionHandlers } from '../action-handlers';
import { Credit } from '../entities';
import { CreditRepository } from '../repositories';

export class CreditDomainService {
  constructor(private readonly creditRepository: CreditRepository) {}

  async recalculateUserCredits(userId: string): Promise<Credit[]> {
    const credits = await this.creditRepository.findByUserId(userId);

    const updatedCredits = actionHandlers.map((ActionHandler) => {
      const actionHandler = new ActionHandler();
      const newCreditAmount = actionHandler.generateNewCredit();
      const credit = credits.find((c) => c.actionName === ActionHandler.actionName);

      // Create a new credit if it doesn't exist
      if (!credit) {
        return new Credit({
          userId,
          id: Credit.generateId(),
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
