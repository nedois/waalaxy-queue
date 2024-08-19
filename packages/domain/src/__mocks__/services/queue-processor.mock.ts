import { QueueProcessor } from '../../services/queue-processor';
import { creditDomainServiceMock } from '../domain-services/credit-domain-service.mock';
import { actionRepositoryMock } from '../repositories/action-repository.mock';
import { creditRepositoryMock } from '../repositories/credit-repository.mock';
import { userRepositoryMock } from '../repositories/user-repository.mock';
import { notifierMock } from './notifier.mock';
import { queueMock } from './queue.mock';

export class QueueProcessorMock extends QueueProcessor {
  prepareUserQueues = jest.fn<Promise<void>, Parameters<QueueProcessor['prepareUserQueues']>>();
  enqueueAction = jest.fn<Promise<void>, Parameters<QueueProcessor['enqueueAction']>>();
}

export const queueProcessorMock = new QueueProcessorMock(
  {
    actionExecutionInterval: 1000,
    renewalCreditsInterval: 2000,
  },
  queueMock,
  actionRepositoryMock,
  creditRepositoryMock,
  userRepositoryMock,
  notifierMock,
  creditDomainServiceMock
);
