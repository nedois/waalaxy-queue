import { BaseActionHandler } from './base.action-handler';

export class BActionHandler extends BaseActionHandler {
  static readonly fakeExecutionTime = 5000; // 5 seconds

  static actionName = 'B' as const;

  public readonly maximumCredit = 16;

  async execute() {
    await this.sleep(BActionHandler.fakeExecutionTime);
  }
}
