import { z } from 'zod';
import { Action } from './action';

const BaseNotification = z.object({
  id: z.string().uuid(),
  message: z.string(),
});

const ActionNotification = BaseNotification.extend({
  type: z.enum(['ACTION_RUNNING', 'ACTION_COMPLETED']),
  payload: Action,
});

// We can add others notifications types in the union
export const Notification = z.discriminatedUnion('type', [ActionNotification]);

export type Notification = z.infer<typeof Notification>;
