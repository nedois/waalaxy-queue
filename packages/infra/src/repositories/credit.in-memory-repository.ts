import { Credit, type ActionName, type CreditRepository } from '@repo/domain';
import assert from 'node:assert';

const database = new Map<string, Credit>();

export class CreditInMemoryRepository implements CreditRepository {
  findByUserId(userId: string): Credit[] {
    return Array.from(database.values()).filter((c) => c.userId === userId);
  }

  findOneByUserIdAndActionName(userId: string, actionName: ActionName): Credit | Promise<Credit> {
    const credit = Array.from(database.values()).find((c) => c.userId === userId && c.actionName === actionName);
    assert(credit, '[ Internal Error ] Credit not found');

    return credit;
  }

  save(credit: Credit) {
    database.set(credit.id, credit);
    return credit;
  }

  saveMany(credits: Credit[]) {
    credits.forEach(this.save);
    return credits;
  }
}
