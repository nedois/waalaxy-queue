import {
  CreateUserActionUseCase,
  CreditDomainService,
  GetUserActionsUseCase,
  GetUserCreditsUseCase,
  GetUserInfoUseCase,
  GetUserQueueUseCase,
  Notifier,
  Queue,
  QueueProcessor,
  type ActionRepository,
  type UserRepository,
} from '@repo/domain';
import { Redis } from 'ioredis';

export interface InjectionContainer {
  // Disconnect services and clean up resources
  dispose(): Promise<void>;

  // Services
  redis: Redis | null;
  notifier: Notifier;
  queueProcessor: QueueProcessor;
  queue: Queue;

  // Domain Services
  creditDomainService: CreditDomainService;

  // Repositories
  userRepository: UserRepository;
  actionRepository: ActionRepository;

  // UseCases
  getUserInfoUseCase: GetUserInfoUseCase;
  getUserActionsUseCase: GetUserActionsUseCase;
  createUserActionUseCase: CreateUserActionUseCase;
  getUserCreditsUseCase: GetUserCreditsUseCase;
  getUserQueueUseCase: GetUserQueueUseCase;
}
