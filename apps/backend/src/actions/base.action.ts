import { randomInt } from '../utils';

export abstract class BaseAction {
  abstract name: string;

  abstract maximumCredit: number;

  abstract execute(): Promise<void>;

  /**
   * @returns a credit between 80% and 100% of the maximum credit
   */
  generateNewCredit(): number {
    return randomInt({ min: this.maximumCredit * 0.8, max: this.maximumCredit });
  }
}
