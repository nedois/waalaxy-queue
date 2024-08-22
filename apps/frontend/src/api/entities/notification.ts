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

const CreditRenewalNotification = BaseNotification.extend({
  type: z.literal('CREDIT_RENEWAL'),
});

// We can add others notifications types in the union
export const Notification = z.discriminatedUnion('type', [ActionNotification, CreditRenewalNotification]);

export type Notification = z.infer<typeof Notification>;
