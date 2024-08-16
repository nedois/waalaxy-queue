import { BaseActionHandler } from './base.action-handler';

export class CActionHandler extends BaseActionHandler {
  static actionName = 'C' as const;

  public readonly maximumCredit = 5;

  async execute() {
    const FAKE_EXECTION_TIME = 3000; // 3 seconds
    await this.sleep(FAKE_EXECTION_TIME);
  }
}
