import {
  CreateUserActionUseCase,
  GetUserActionsUseCase,
  GetUserCreditsUseCase,
  GetUserInfoUseCase,
  GetUserQueueUseCase,
  Notifier,
  Queue,
  QueueProcessor,
  RecalculateUserCreditsUseCase,
  type ActionRepository,
  type UserRepository,
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
import { Redis } from 'ioredis';
import { env } from './env';
import { redis } from './services/redis';

interface InjectionContainer {
  // Disconnect services and clean up resources
  dispose(): Promise<void>;

  // Services
  redis: Redis | null;

  // Domain Services
  notifier: Notifier;
  queueProcessor: QueueProcessor;
  queue: Queue;

  // Repositories
  userRepository: UserRepository;
  actionRepository: ActionRepository;

  // UseCases
  getUserInfoUseCase: GetUserInfoUseCase;
  getUserActionsUseCase: GetUserActionsUseCase;
  createUserActionUseCase: CreateUserActionUseCase;
  getUserCreditsUseCase: GetUserCreditsUseCase;
  recalculateUserCreditsUseCase: RecalculateUserCreditsUseCase;
  getUserQueueUseCase: GetUserQueueUseCase;
}

// Repositories
const userRepository = redis ? new UserRedisRepository(redis) : new UserInMemoryRepository();
const actionRepository = redis ? new ActionRedisRepository(redis) : new ActionInMemoryRepository();
const creditRepository = redis ? new CreditRedisRepository(redis) : new CreditInMemoryRepository();

// UseCases
const getUserInfoUseCase = new GetUserInfoUseCase(userRepository);
const getUserActionsUseCase = new GetUserActionsUseCase(actionRepository);
const getUserCreditsUseCase = new GetUserCreditsUseCase(creditRepository);
const recalculateUserCreditsUseCase = new RecalculateUserCreditsUseCase(creditRepository);

// Domain services
const queueProcessorOptions = {
  actionExecutionInterval: env.QUEUE_EXECUTION_INTERVAL_IN_MS,
  renewalCreditsInterval: env.CREDITS_RENEWAL_INTERVAL_IN_MS,
};

const notifier = new SSENotifier();
const queue = redis ? new RedisQueue(redis) : new InMemoryQueue();
const QueueProcessorClass = redis ? RedisQueueProcessor : InMemoryQueueProcessor;
const queueProcessor = new QueueProcessorClass(
  queueProcessorOptions,
  queue,
  actionRepository,
  creditRepository,
  userRepository,
  notifier,
  recalculateUserCreditsUseCase
);

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
