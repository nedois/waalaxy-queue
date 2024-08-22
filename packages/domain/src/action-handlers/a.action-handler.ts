import { BaseActionHandler } from './base.action-handler';

export class AActionHandler extends BaseActionHandler {
  static readonly fakeExecutionTime = 6000; // 6 seconds

  static actionName = 'A' as const;

  public readonly maximumCredit = 10;

  async execute() {
    await this.sleep(AActionHandler.fakeExecutionTime);
  }
}
