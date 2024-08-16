import { z } from 'zod';

export const Credit = z.object({
  id: z.string().uuid(),
  actionName: z.string(),
  amount: z.number(),
});

export type Credit = z.infer<typeof Credit>;
