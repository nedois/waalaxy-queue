import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  lastActionExecutedAt: z.coerce.date().nullable(),
  locked: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;
