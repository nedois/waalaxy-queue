import { BaseActionHandler } from './base.action-handler';

export class AActionHandler extends BaseActionHandler {
  static actionName = 'A' as const;

  public readonly maximumCredit = 10;

  async execute() {
    const FAKE_EXECTION_TIME = 2000; // 2 seconds
    await this.sleep(FAKE_EXECTION_TIME);
  }
}
