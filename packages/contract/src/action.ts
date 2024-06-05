import { z } from 'zod';

export const ActionNameSchema = z.enum(['A', 'B', 'C']);

export type ActionName = z.infer<typeof ActionNameSchema>;

export const ActionStatusSchema = z.enum(['PENDING', 'COMPLETED', 'FAILED']);

export const ActionSchema = z.object({
  id: z.string().uuid(),
  name: ActionNameSchema,
  status: ActionStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Action = z.infer<typeof ActionSchema>;

/* --------------------------------- REQUEST -------------------------------- */

export const CreateActionDtoSchema = z.object({
  id: z.string().uuid(),
  name: ActionNameSchema,
});

export type CreateActionDto = z.infer<typeof CreateActionDtoSchema>;
