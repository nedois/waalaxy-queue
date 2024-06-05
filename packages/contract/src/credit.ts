import { z } from 'zod';

import { ActionNameSchema } from './action';

export const CreditSchema = z.object({
  actionName: ActionNameSchema,
  amount: z.number().int().min(0),
});

export type Credit = z.infer<typeof CreditSchema>;
