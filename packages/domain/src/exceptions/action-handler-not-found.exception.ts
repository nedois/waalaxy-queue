import { BaseException } from './base.exception';

export class ActionHandlerNotFoundException extends BaseException {
  public readonly code = 'ACTION_HANDLER_NOT_FOUND';

  public readonly statusCode = 500;

  constructor(actionName: string) {
    super(`Action handler for ${actionName} not found`);
  }
}
