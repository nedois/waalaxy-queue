import { z } from 'zod';

export const Action = z.object({
  id: z.string().uuid(),
  name: z.enum(['A', 'B', 'C']),
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED']),
  createdAt: z.date(),
  updatedAt: z.date(),
  runnedAt: z.date().nullable(),
});

export type Action = z.infer<typeof Action>;
