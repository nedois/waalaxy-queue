import { z } from 'zod';

export const Action = z.object({
  id: z.string().uuid(),
  name: z.enum(['A', 'B', 'C']),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  runnedAt: z.coerce.date().nullable(),
});

export type Action = z.infer<typeof Action>;
