import { GetUserInfoUseCase, type UserRepository } from '@repo/domain';
import { UserInMemoryRepository, UserRedisRepository } from '@repo/infra';
import { Redis } from 'ioredis';
import { redis } from './services/redis';

interface InjectionContainer {
  // Disconnect services and clean up resources
  dispose(): Promise<void>;

  // Services
  redis: Redis | null;

  // Repositories
  userRepository: UserRepository;

  // UseCases
  getUserInfoUseCase: GetUserInfoUseCase;
}

async function dispose() {
  if (redis) {
    await redis.quit();
  }
}

// Repositories
const userRepository = redis ? new UserRedisRepository(redis) : new UserInMemoryRepository();

// UseCases
const getUserInfoUseCase = new GetUserInfoUseCase(userRepository);

export const container: InjectionContainer = {
  dispose,
  redis,
  userRepository,
  getUserInfoUseCase,
};
