import {
  CreateUserActionUseCase,
  GetUserActionsUseCase,
  GetUserCreditsUseCase,
  GetUserInfoUseCase,
  GetUserQueueUseCase,
  RecalculateUserCreditsUseCase,
} from '@repo/domain';
import {
  ActionInMemoryRepository,
  ActionRedisRepository,
  CreditInMemoryRepository,
  CreditRedisRepository,
  InMemoryQueue,
  InMemoryQueueProcessor,
  RedisQueue,
  RedisQueueProcessor,
  SSENotifier,
  UserInMemoryRepository,
  UserRedisRepository,
} from '@repo/infra';
import { env } from '../env';
import { redis } from '../services/redis';
import { InjectionContainer } from './di.types';

// Repositories
const userRepository = redis ? new UserRedisRepository(redis) : new UserInMemoryRepository();
const actionRepository = redis ? new ActionRedisRepository(redis) : new ActionInMemoryRepository();
const creditRepository = redis ? new CreditRedisRepository(redis) : new CreditInMemoryRepository();

// Domain services
const queueProcessorOptions = {
  actionExecutionInterval: env.QUEUE_EXECUTION_INTERVAL_IN_MS,
  renewalCreditsInterval: env.CREDITS_RENEWAL_INTERVAL_IN_MS,
};

const notifier = new SSENotifier();
const queue = redis ? new RedisQueue(redis, actionRepository) : new InMemoryQueue(actionRepository);
const QueueProcessorClass = redis ? RedisQueueProcessor : InMemoryQueueProcessor;

const recalculateUserCreditsUseCase = new RecalculateUserCreditsUseCase(creditRepository);
const queueProcessor = new QueueProcessorClass(
  queueProcessorOptions,
  queue,
  actionRepository,
  creditRepository,
  userRepository,
  notifier,
  recalculateUserCreditsUseCase
);

// UseCases
const getUserInfoUseCase = new GetUserInfoUseCase(userRepository);
const getUserActionsUseCase = new GetUserActionsUseCase(actionRepository);
const getUserCreditsUseCase = new GetUserCreditsUseCase(creditRepository);
const createUserActionUseCase = new CreateUserActionUseCase(actionRepository, userRepository, queueProcessor);
const getUserQueueUseCase = new GetUserQueueUseCase(queueProcessor);

async function dispose() {
  await queueProcessor.stop();

  if (redis) {
    await redis.quit();
  }
}

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
  getUserQueueUseCase,
  queueProcessor,
  queue,
  notifier,
};
