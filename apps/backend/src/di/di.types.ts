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
import { Redis } from 'ioredis';

export interface InjectionContainer {
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
