import { Credit, EntityNotFoundException, type ActionName, type CreditRepository } from '@repo/domain';
import assert from 'node:assert';

const database = new Map<string, Credit>();

export class CreditInMemoryRepository implements CreditRepository {
  public readonly database = database;

  findByUserId(userId: string): Credit[] {
    return Array.from(this.database.values()).filter((c) => c.userId === userId);
  }

  findOneByUserIdAndActionName(userId: string, actionName: ActionName): Credit | Promise<Credit> {
    const credit = Array.from(this.database.values()).find((c) => c.userId === userId && c.actionName === actionName);
    assert(credit, new EntityNotFoundException(Credit, actionName));

    return credit;
  }

  save(credit: Credit) {
    this.database.set(credit.id, credit);
    return credit;
  }

  saveMany(credits: Credit[]) {
    credits.forEach((credit) => this.save(credit));
    return credits;
  }
}
