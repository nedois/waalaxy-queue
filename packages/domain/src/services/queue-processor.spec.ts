import assert from 'node:assert';
import { actionRepositoryMock, creditRepositoryMock, notifierMock, queueMock, userRepositoryMock } from '../__mocks__';
import { AActionHandler, BActionHandler } from '../action-handlers';
import { CreditDomainService } from '../domain-services';
import { Action, Credit, User } from '../entities';
import { QueueProcessorNotInitializedException } from '../exceptions';
import { QueueProcessor } from './queue-processor';

const TEN_MINUTES_IN_MS = 600000;
const FIFTHTEEN_SECONDS_IN_MS = 15000;

describe('QueueProcessor', () => {
  let queueProcessor: QueueProcessor;
  let creditDomainService: CreditDomainService;
  let user: User;
  let credits: Credit[];
  let actions: Action[];

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick'] });

    user = new User({
      id: '4310a855-19b2-4af7-815e-019cfa5c31d1',
      username: 'user',
      lastActionExecutedAt: null,
      lockedQueueAt: null,
    });

    credits = [];

    actions = [];

    const options = {
      actionExecutionInterval: FIFTHTEEN_SECONDS_IN_MS,
      renewalCreditsInterval: TEN_MINUTES_IN_MS,
    };

    userRepositoryMock.find.mockReturnValue([user]);
    userRepositoryMock.findOne.mockReturnValue(user);
    queueMock.peek.mockReturnValue(actions);
    queueMock.enqueue.mockImplementation((action) => {
      actions.push(action);
    });
    queueMock.remove.mockImplementation((action) => {
      actions = actions.filter((a) => a.id !== action.id);
    });
    creditRepositoryMock.findByUserId.mockResolvedValue(credits);
    creditRepositoryMock.saveMany.mockImplementation((newCredits) => {
      credits = newCredits;
      return credits;
    });
    creditRepositoryMock.findOneByUserIdAndActionName.mockImplementation((userId, actionName) => {
      const credit = credits.find((c) => c.userId === userId && c.actionName === actionName);
      assert(credit, "Did you forget to mock the credit you're looking for?");
      return credit;
    });

    creditDomainService = new CreditDomainService(creditRepositoryMock);

    queueProcessor = new QueueProcessor(
      options,
      queueMock,
      actionRepositoryMock,
      creditRepositoryMock,
      userRepositoryMock,
      notifierMock,
      creditDomainService
    );
  });

  afterEach(async () => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize and schedule actions correctly', async () => {
      await queueProcessor.initialize();
      expect(queueProcessor.isInitialized).toBe(true);
      expect(queueProcessor.isShuttingDown).toBe(false);
      expect(queueProcessor.initializedAt).toBeInstanceOf(Date);
    });

    it('should not initialize if it is already initialized', async () => {
      await queueProcessor.initialize();
      const firstInitializationTime = queueProcessor.initializedAt?.getTime();

      await queueProcessor.initialize();
      const secondInitializationTime = queueProcessor.initializedAt?.getTime();

      expect(firstInitializationTime).toBe(secondInitializationTime);
    });
  });

  describe('enqueueAction', () => {
    it('should not enqueue action if the queue processor is not initialized', async () => {
      const action = new Action({
        id: '9f8987ae-3ef0-4dd7-9c3d-1cc4dfc1e6dc',
        name: 'A',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });

      await expect(queueProcessor.enqueueAction(action)).rejects.toThrow(new QueueProcessorNotInitializedException());
    });

    it('should enqueue action correctly', async () => {
      const credit = new Credit({
        id: '4cbbcc1e-24f2-4363-aa9c-6d82a4f9f8e0',
        actionName: 'A',
        amount: 3,
        userId: user.id,
      });
      credits.push(credit);

      const action = new Action({
        id: '9f8987ae-3ef0-4dd7-9c3d-1cc4dfc1e6dc',
        name: 'A',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });

      await queueProcessor.initialize();
      await queueProcessor.enqueueAction(action);

      const userQueue = await queueMock.peek(action.userId);
      expect(userQueue).toStrictEqual([action]);
    });

    it('should execute the action immediatly if no action was executed in the past 15s', async () => {
      const credit = new Credit({
        id: '4cbbcc1e-24f2-4363-aa9c-6d82a4f9f8e0',
        actionName: 'A',
        amount: 3,
        userId: user.id,
      });
      credits.push(credit);

      const action = new Action({
        id: '9f8987ae-3ef0-4dd7-9c3d-1cc4dfc1e6dc',
        name: 'A',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });

      await queueProcessor.initialize();
      await queueProcessor.enqueueAction(action);

      expect(user.lastActionExecutedAt).toBeNull();

      jest.advanceTimersByTime(0);
      await new Promise(process.nextTick);
      expect(action.status).toBe('RUNNING');
      expect(user.lastActionExecutedAt).toBeInstanceOf(Date);
    });

    it('should decrement the user action credit after executing the action', async () => {
      credits.push(
        new Credit({
          id: '4cbbcc1e-24f2-4363-aa9c-6d82a4f9f8e0',
          actionName: 'A',
          amount: 3,
          userId: user.id,
        })
      );

      const action = new Action({
        id: '9f8987ae-3ef0-4dd7-9c3d-1cc4dfc1e6dc',
        name: 'A',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });

      await queueProcessor.initialize();
      await queueProcessor.enqueueAction(action);

      expect(user.lastActionExecutedAt).toBeNull();

      jest.advanceTimersByTime(0);
      await new Promise(process.nextTick);
      expect(action.status).toBe('RUNNING');

      jest.advanceTimersByTime(AActionHandler.fakeExecutionTime);
      await new Promise(process.nextTick);
      expect(action.status).toBe('COMPLETED');
      expect(credits[0].amount).toBe(2);
    });

    it('should execute the action in 15s if an action was executed in the past 15s', async () => {
      credits.push(
        new Credit({
          id: '4cbbcc1e-24f2-4363-aa9c-6d82a4f9f8e0',
          actionName: 'A',
          amount: 3,
          userId: user.id,
        })
      );

      const action1 = new Action({
        id: '9f8987ae-3ef0-4dd7-9c3d-1cc4dfc1e6dc',
        name: 'A',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });
      const action2 = new Action({
        id: '4cbbcc1e-24f2-4363-aa9c-6d82a4f9f8e0',
        name: 'A',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });

      await queueProcessor.initialize();
      await queueProcessor.enqueueAction(action1);
      await queueProcessor.enqueueAction(action2);

      let currentTimerTime = 0;

      // Runs action 1 immediately
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action1.status).toBe('RUNNING');
      expect(action2.status).toBe('PENDING');
      expect(user.lastActionExecutedAt).toBeInstanceOf(Date);

      // Add action A execution time
      currentTimerTime += AActionHandler.fakeExecutionTime;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action1.status).toBe('COMPLETED');
      expect(action2.status).toBe('PENDING');

      // Add arbitrary time smaller than 15s
      currentTimerTime += 2000;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action2.status).toBe('PENDING');

      // Go to 15s
      currentTimerTime = FIFTHTEEN_SECONDS_IN_MS - currentTimerTime;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action2.status).toBe('RUNNING');

      // Add action A execution time
      currentTimerTime += AActionHandler.fakeExecutionTime;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action2.status).toBe('COMPLETED');
    });

    it('should skip actions without enough credit', async () => {
      credits.push(
        new Credit({
          id: '4cbbcc1e-24f2-4363-aa9c-6d82a4f9f8e0',
          actionName: 'A',
          amount: 0,
          userId: user.id,
        }),
        new Credit({
          id: '5050dazd-24f2-4363-aa9c-6d82a4f9f8e0',
          actionName: 'B',
          amount: 3,
          userId: user.id,
        })
      );

      const action1A = new Action({
        id: '9f8987ae-3ef0-4dd7-9c3d-1cc4dfc1e6dc',
        name: 'A',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });
      const action2A = new Action({
        id: '4cbbcc1e-24f2-4363-aa9c-6d82a4f9f8e0',
        name: 'A',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });
      const action1B = new Action({
        id: '151a00d1-24f2-4363-aa9c-6d82a4f9f8e0',
        name: 'B',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });

      await queueProcessor.initialize();
      await queueProcessor.enqueueAction(action1A);
      await queueProcessor.enqueueAction(action2A);
      await queueProcessor.enqueueAction(action1B);

      let currentTimerTime = 0;

      // Runs action 1 immediately
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action1A.status).toBe('PENDING');
      expect(action2A.status).toBe('PENDING');
      expect(action1B.status).toBe('RUNNING');
      expect(user.lastActionExecutedAt).toBeInstanceOf(Date);

      // Add action A execution time
      currentTimerTime += BActionHandler.fakeExecutionTime;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action1A.status).toBe('PENDING');
      expect(action2A.status).toBe('PENDING');
      expect(action1B.status).toBe('COMPLETED');
    });
  });

  describe('renewalCredits', () => {
    it('should recalculate user credits after 10 minutes', async () => {
      const credit = new Credit({
        id: '4cbbcc1e-24f2-4363-aa9c-6d82a4f9f8e0',
        actionName: 'A',
        amount: 0,
        userId: user.id,
      });
      credits.push(credit);

      await queueProcessor.initialize();

      jest.advanceTimersByTime(TEN_MINUTES_IN_MS);
      await new Promise(process.nextTick);
      expect(credit.amount).not.toBe(0);
    });

    it('should run pending actions after renewing credits', async () => {
      const credit = new Credit({
        id: '4cbbcc1e-24f2-4363-aa9c-6d82a4f9f8e0',
        actionName: 'A',
        amount: 0,
        userId: user.id,
      });
      credits.push(credit);

      const action = new Action({
        id: '9f8987ae-3ef0-4dd7-9c3d-1cc4dfc1e6dc',
        name: 'A',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });

      await queueProcessor.initialize();
      await queueProcessor.enqueueAction(action);

      let currentTimerTime = 0;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action.status).toBe('PENDING');

      // Advance action A execution time
      currentTimerTime += AActionHandler.fakeExecutionTime;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action.status).toBe('PENDING');

      // Advance to 10 minutes
      currentTimerTime = TEN_MINUTES_IN_MS - currentTimerTime;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action.status).toBe('PENDING');

      // Advance 1 second
      currentTimerTime += 1000;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action.status).toBe('RUNNING');
    });

    it('should return the time until the next renewal', async () => {
      await queueProcessor.initialize();

      let currentTimerTime = 0;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(queueProcessor.msUntilCreditRenewal).toBe(TEN_MINUTES_IN_MS);

      // Advance 5 minutes
      currentTimerTime += 300000;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(queueProcessor.msUntilCreditRenewal).toBe(TEN_MINUTES_IN_MS - 300000);
    });
  });

  describe('stop', () => {
    it('should stop the queue processor if no action is running', async () => {
      await queueProcessor.initialize();
      await queueProcessor.stop();

      expect(queueProcessor.isShuttingDown).toBe(false);
      expect(queueProcessor.isInitialized).toBe(false);

      // Ensure all timers are cleared
      expect(queueProcessor['renewalCreditsInterval']).toBeNull();
      expect(queueProcessor['queueTimeouts'].size).toBe(0);
    });

    it('should wait for running actions before stopping', async () => {
      const credit = new Credit({
        id: '4cbbcc1e-24f2-4363-aa9c-6d82a4f9f8e0',
        actionName: 'A',
        amount: 3,
        userId: user.id,
      });
      credits.push(credit);

      const action = new Action({
        id: '9f8987ae-3ef0-4dd7-9c3d-1cc4dfc1e6dc',
        name: 'A',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
        status: 'PENDING',
      });

      await queueProcessor.initialize();
      await queueProcessor.enqueueAction(action);

      expect(user.lastActionExecutedAt).toBeNull();

      let currentTimerTime = 0;

      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action.status).toBe('RUNNING');
      expect(user.lastActionExecutedAt).toBeInstanceOf(Date);

      await queueProcessor.stop();

      expect(queueProcessor.isShuttingDown).toBe(true);
      expect(queueProcessor.isInitialized).toBe(true);

      // Advance 1 second
      currentTimerTime += 1000;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action.status).toBe('RUNNING');
      expect(queueProcessor.isShuttingDown).toBe(true);
      expect(queueProcessor.isInitialized).toBe(true);

      // Advance action A execution time
      currentTimerTime += AActionHandler.fakeExecutionTime;
      jest.advanceTimersByTime(currentTimerTime);
      await new Promise(process.nextTick);
      expect(action.status).toBe('COMPLETED');
      expect(queueProcessor.isShuttingDown).toBe(false);
      expect(queueProcessor.isInitialized).toBe(false);
    });
  });
});
