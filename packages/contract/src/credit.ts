import { z } from 'zod';

export const CreditSchema = z.number().int().min(0);

export type Credit = z.infer<typeof CreditSchema>;
