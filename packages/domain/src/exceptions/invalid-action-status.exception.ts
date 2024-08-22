import { Action } from '../entities';
import { BaseException } from './base.exception';

export class InvalidActionStatusException extends BaseException {
  public readonly code = 'INVALID_ACTION_STATUS';

  public readonly statusCode = 500;

  constructor(receivedStatus: Action['status'], expectedStatus: Action['status']) {
    super(`Action status must be ${expectedStatus} but received ${receivedStatus}`);
  }
}
