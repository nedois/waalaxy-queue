import { z } from 'zod';

export const env = z
  .object({
    PORT: z.coerce.number().int().positive(),
    HOST: z.string(),
    CREDITS_RENEWAL_INTERVAL_IN_MS: z.coerce.number().int().positive(),
    QUEUE_EXECUTION_INTERVAL_IN_MS: z.coerce.number().int().positive(),

    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number().int().positive(),
    REDIS_PASSWORD: z.string(),
    REDIS_DB: z.coerce.number().int(),

    DB_TYPE: z.enum(['memory', 'redis']),
  })
  .parse(process.env);
