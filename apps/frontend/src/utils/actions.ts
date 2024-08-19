import { Action } from '../api';
import { capitalize } from './text';

export function formatActionStatus(status: Action['status']) {
  return capitalize(status.toLowerCase());
}
