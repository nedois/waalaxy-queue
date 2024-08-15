import { BaseActionHandler } from './base.action-handler';

export class BActionHandler extends BaseActionHandler {
  public readonly name = 'B';

  public readonly maximumCredit = 16;

  async execute() {
    const FAKE_EXECTION_TIME = 5000; // 5 seconds
    await this.sleep(FAKE_EXECTION_TIME);
  }
}
