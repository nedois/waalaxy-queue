import { QueueProcessor } from '../../services/queue-processor';
import { creditDomainServiceMock } from '../domain-services/credit-domain-service.mock';
import { actionRepositoryMock } from '../repositories/action-repository.mock';
import { creditRepositoryMock } from '../repositories/credit-repository.mock';
import { userRepositoryMock } from '../repositories/user-repository.mock';
import { notifierMock } from './notifier.mock';
import { queueMock } from './queue.mock';

export class QueueProcessorMock extends QueueProcessor {
  getUserQueue = jest.fn<ReturnType<QueueProcessor['getUserQueue']>, Parameters<QueueProcessor['getUserQueue']>>();
  enqueueAction = jest.fn<ReturnType<QueueProcessor['enqueueAction']>, Parameters<QueueProcessor['enqueueAction']>>();
  prepareUserQueues = jest.fn<
    ReturnType<QueueProcessor['prepareUserQueues']>,
    Parameters<QueueProcessor['prepareUserQueues']>
  >();
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
