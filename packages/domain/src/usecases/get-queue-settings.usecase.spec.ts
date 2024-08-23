import {
  QueueProcessorMock,
  actionRepositoryMock,
  creditDomainServiceMock,
  creditRepositoryMock,
  notifierMock,
  queueMock,
  userRepositoryMock,
} from '../__mocks__';
import { QueueProcessor } from '../services';
import { GetQueueSettingsUseCase } from './get-queue-settings.usecase';

describe('GetQueueSettingsUseCase', () => {
  const CREDIT_RENEWAL_INTERVAL = 20000;
  const ACTION_EXECUTION_INTERVAL = 15000;

  let usecase: GetQueueSettingsUseCase;
  let queueProcessorMock: QueueProcessor;

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick'] });

    userRepositoryMock.find.mockResolvedValue([]);

    queueProcessorMock = new QueueProcessorMock(
      {
        actionExecutionInterval: ACTION_EXECUTION_INTERVAL,
        renewalCreditsInterval: CREDIT_RENEWAL_INTERVAL,
      },
      queueMock,
      actionRepositoryMock,
      creditRepositoryMock,
      userRepositoryMock,
      notifierMock,
      creditDomainServiceMock
    );
    usecase = new GetQueueSettingsUseCase(queueProcessorMock);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should return all settings if the queue is initialized', async () => {
    await queueProcessorMock.initialize();

    expect(usecase.execute()).resolves.toEqual({
      timeUntilCreditRenewal: CREDIT_RENEWAL_INTERVAL,
      creditRenewalInterval: CREDIT_RENEWAL_INTERVAL,
      actionExecutionInterval: ACTION_EXECUTION_INTERVAL,
    });

    // Advance 10 seconds
    jest.advanceTimersByTime(10000);
    await new Promise(process.nextTick);
    expect(usecase.execute()).resolves.toEqual({
      timeUntilCreditRenewal: CREDIT_RENEWAL_INTERVAL - 10000,
      creditRenewalInterval: CREDIT_RENEWAL_INTERVAL,
      actionExecutionInterval: ACTION_EXECUTION_INTERVAL,
    });
  });

  it('should return "null" for "timeUntilCreditRenewal" if the queue is not initialized', async () => {
    expect(usecase.execute()).resolves.toEqual({
      timeUntilCreditRenewal: null,
      creditRenewalInterval: CREDIT_RENEWAL_INTERVAL,
      actionExecutionInterval: ACTION_EXECUTION_INTERVAL,
    });
  });
});
