import { BaseActionHandler } from './base.action-handler';

export class BActionHandler extends BaseActionHandler {
  static actionName = 'B' as const;

  public readonly maximumCredit = 16;

  async execute() {
    const FAKE_EXECTION_TIME = 5000; // 5 seconds
    await this.sleep(FAKE_EXECTION_TIME);
  }
}
