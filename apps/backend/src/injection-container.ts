import {
  CreateUserActionUseCase,
  GetUserActionsUseCase,
  GetUserInfoUseCase,
  type ActionRepository,
  type UserRepository,
} from '@repo/domain';
import {
  ActionInMemoryRepository,
  ActionRedisRepository,
  UserInMemoryRepository,
  UserRedisRepository,
} from '@repo/infra';
import { Redis } from 'ioredis';
import { redis } from './services/redis';

interface InjectionContainer {
  // Disconnect services and clean up resources
  dispose(): Promise<void>;

  // Services
  redis: Redis | null;

  // Repositories
  userRepository: UserRepository;
  actionRepository: ActionRepository;

  // UseCases
  getUserInfoUseCase: GetUserInfoUseCase;
  getUserActionsUseCase: GetUserActionsUseCase;
  createUserActionUseCase: CreateUserActionUseCase;
}

async function dispose() {
  if (redis) {
    await redis.quit();
  }
}

// Repositories
const userRepository = redis ? new UserRedisRepository(redis) : new UserInMemoryRepository();
const actionRepository = redis ? new ActionRedisRepository(redis) : new ActionInMemoryRepository();

// UseCases
const getUserInfoUseCase = new GetUserInfoUseCase(userRepository);
const getUserActionsUseCase = new GetUserActionsUseCase(actionRepository);
const createUserActionUseCase = new CreateUserActionUseCase(actionRepository, userRepository);

export const container: InjectionContainer = {
  dispose,
  redis,
  userRepository,
  actionRepository,
  getUserInfoUseCase,
  getUserActionsUseCase,
  createUserActionUseCase,
};
