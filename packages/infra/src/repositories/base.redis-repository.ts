import { Redis } from 'ioredis';

export abstract class BaseRedisRepository {
  constructor(protected readonly redis: Redis) {}
}
