import { z } from 'zod';

export const User = z.object({
  id: z.string().uuid(),
  username: z.string(),
  lastActionExecutedAt: z.coerce.date().nullable(),
});

export type User = z.infer<typeof User>;
