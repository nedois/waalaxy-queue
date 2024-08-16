import { Action } from '../entities';

/** Do not use the Queue directly, use the QueueProcessor class */
export abstract class Queue {
  /** Add an action at the end of the user queue */
  abstract enqueue(action: Action): Promise<void> | void;

  /** Remove the first action from the user queue */
  abstract dequeue(userId: string): Promise<void> | void;

  /** Get queue actions */
  abstract peek(userId: string): Promise<Action[]> | Action[];
}
