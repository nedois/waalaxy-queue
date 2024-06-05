import { z } from 'zod';

export const env = z
  .object({
    PORT: z.coerce.number().int().positive(),
    HOST: z.string(),
    CREDITS_RENEWAL_INTERVAL_IN_MS: z.coerce.number().int().positive(),
    QUEUE_ACTION_EXECUTION_INTERVAL_IN_MS: z.coerce.number().int().positive(),
  })
  .parse(process.env);
