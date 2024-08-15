import type { ActionName } from '../entities';

export abstract class BaseActionHandler {
  abstract readonly name: ActionName;

  abstract readonly maximumCredit: number;

  abstract execute(): Promise<void>;

  /**
   * @returns a credit between 80% and 100% of the maximum credit
   */
  generateNewCredit() {
    return this.randomInt({ min: this.maximumCredit * 0.8, max: this.maximumCredit });
  }

  protected sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private randomInt(args: Record<'min' | 'max', number>) {
    const min = Math.ceil(args.min);
    const max = Math.floor(args.max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
