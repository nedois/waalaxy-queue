import { BaseActionHandler } from './base.action-handler';

export class CActionHandler extends BaseActionHandler {
  static readonly fakeExecutionTime = 4000; // 4 seconds

  static actionName = 'C' as const;

  public readonly maximumCredit = 5;

  async execute() {
    await this.sleep(CActionHandler.fakeExecutionTime);
  }
}
