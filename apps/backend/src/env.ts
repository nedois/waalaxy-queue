import { z } from 'zod';

export const env = z
  .object({
    PORT: z.coerce.number().int().positive(),
    HOST: z.string(),
    CREDITS_RENEWAL_INTERVAL_IN_MS: z.coerce.number().int().positive(),
    QUEUE_EXECUTION_INTERVAL_IN_MS: z.coerce.number().int().positive(),

    REDIS_HOST: z.string().optional().default('localhost'),
    REDIS_PORT: z.coerce.number().int().positive().optional().default(6379),
    REDIS_PASSWORD: z.string().optional().default(''),
    REDIS_DB: z.coerce.number().int().optional().default(0),

    DB_TYPE: z.enum(['memory', 'redis']),
  })
  .parse(process.env);
