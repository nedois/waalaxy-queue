import type { ActionName, Credit } from '../entities';

export interface CreditRepository {
  findByUserId(userId: string): Promise<Credit[]> | Credit[];
  findOneByUserIdAndActionName(userId: string, actionName: ActionName): Promise<Credit> | Credit;
  save(credit: Credit): Promise<Credit> | Credit;
  saveMany(credits: Credit[]): Promise<Credit[]> | Credit[];
}
