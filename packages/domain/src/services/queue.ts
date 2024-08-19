import { Action } from '../entities';

/** Do not use the Queue directly, use the QueueProcessor class */
export abstract class Queue {
  /** Add an action at the end of the user queue */
  abstract enqueue(action: Action): Promise<void> | void;

  /**
   * Remove an action from the user queue.
   * It should throw an error if the action status is not COMPLETED
   * or if the action is not in the queue.
   **/
  abstract remove(action: Action): Promise<void> | void;

  /** Get queue actions */
  abstract peek(userId: string): Promise<Action[]> | Action[];
}
