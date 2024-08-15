import {
  CreateUserActionUseCase,
  GetUserActionsUseCase,
  GetUserCreditsUseCase,
  GetUserInfoUseCase,
  RecalculateUserCreditsUseCase,
  type ActionRepository,
  type UserRepository,
} from '@repo/domain';
import {
  ActionInMemoryRepository,
  ActionRedisRepository,
  CreditInMemoryRepository,
  CreditRedisRepository,
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
  getUserCreditsUseCase: GetUserCreditsUseCase;
  recalculateUserCreditsUseCase: RecalculateUserCreditsUseCase;
}

async function dispose() {
  if (redis) {
    await redis.quit();
  }
}

// Repositories
const userRepository = redis ? new UserRedisRepository(redis) : new UserInMemoryRepository();
const actionRepository = redis ? new ActionRedisRepository(redis) : new ActionInMemoryRepository();
const creditRepository = redis ? new CreditRedisRepository(redis) : new CreditInMemoryRepository();

// UseCases
const getUserInfoUseCase = new GetUserInfoUseCase(userRepository);
const getUserActionsUseCase = new GetUserActionsUseCase(actionRepository);
const createUserActionUseCase = new CreateUserActionUseCase(actionRepository, userRepository);
const getUserCreditsUseCase = new GetUserCreditsUseCase(creditRepository);
const recalculateUserCreditsUseCase = new RecalculateUserCreditsUseCase(creditRepository);

export const container: InjectionContainer = {
  dispose,
  redis,
  userRepository,
  actionRepository,
  getUserInfoUseCase,
  getUserActionsUseCase,
  createUserActionUseCase,
  getUserCreditsUseCase,
  recalculateUserCreditsUseCase,
};
