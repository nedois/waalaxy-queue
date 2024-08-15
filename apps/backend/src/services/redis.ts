import { Redis } from 'ioredis';
import { env } from '../env';

export const redis =
  env.DB_TYPE === 'redis'
    ? new Redis({
        db: env.REDIS_DB,
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
      })
    : null;
