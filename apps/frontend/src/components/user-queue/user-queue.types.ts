import type { UseCountdownReturn } from '../../hooks';

export interface QueueActionProps {
  active?: boolean;
  /**
   * Whether the action is idle.
   * For example, when there is no enought credits to run the action.
   */
  idle?: boolean;
}

export interface QueueNextActionCounterProps {
  startsAt: number;
}

export type QueueNextActionCounterRef = Pick<UseCountdownReturn, 'resetCountdown' | 'startCountdown'>;
