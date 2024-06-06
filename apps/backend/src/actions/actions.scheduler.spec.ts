import { parentPort, Worker } from 'node:worker_threads';
import { Action } from '@waalaxy/contract';

import { database } from '../database';
import { ActionsScheduler } from './actions.scheduler';
import { BaseAction } from './base.action';

const USER_ID = 'John';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

jest.mock('node:worker_threads', () => ({
  parentPort: {
    on: jest.fn(),
    postMessage: jest.fn(),
  },
  Worker: class MockNodeWorker {
    constructor() {
      const workerMethods = Object.getOwnPropertyNames(Worker.prototype).filter(
        (methodName) => typeof Worker.prototype[methodName] === 'function'
      );

      workerMethods.forEach((methodName) => {
        this[methodName] = jest.fn();
      });
    }

    on = jest.fn();
    off = jest.fn();
  },
}));

describe('ActionsScheduler', () => {
  let scheduler: ActionsScheduler;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    scheduler = new ActionsScheduler(database);

    database.reset();
    database.registerUser(USER_ID);
  });

  describe('process', () => {
    it('executes action and emits message', async () => {
      const action: Action = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      };

      const actionInstance: BaseAction = {
        execute: jest.fn().mockResolvedValue(null),
        generateNewCredit: jest.fn(),
        maximumCredit: 1,
        name: 'A',
      };

      jest.spyOn(scheduler, 'getActionInstance').mockReturnValue(actionInstance);

      database.createUserAction(USER_ID, action);
      await scheduler.process(USER_ID, action);

      expect(parentPort?.postMessage).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          userId: USER_ID,
          data: { actionId: action.id, type: 'ACTION:RUNNING' },
          context: { database: expect.anything() },
        })
      );

      expect(parentPort?.postMessage).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          userId: USER_ID,
          data: { actionId: action.id, type: 'ACTION:COMPLETED' },
          context: { database: expect.anything() },
        })
      );
    });
  });

  describe('scheduleNextAction', () => {
    it('should schedule next action immediately if no timeout exists', async () => {
      jest.spyOn(scheduler, 'process').mockImplementation(jest.fn());

      const action: Action = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'A',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
        runnedAt: null,
      };

      database.createUserAction(USER_ID, action);

      await scheduler.scheduleNextAction(USER_ID);

      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 0);
    });

    it('does not schedule action if user is locked', async () => {
      jest.spyOn(scheduler, 'process').mockImplementation(jest.fn());

      database.updatedUser(USER_ID, { locked: true });
      await scheduler.scheduleNextAction(USER_ID);
      expect(setTimeout).not.toHaveBeenCalled();
    });

    it('does not schedule action if there are no actions to process', async () => {
      jest.spyOn(scheduler, 'process').mockImplementation(jest.fn());

      await scheduler.scheduleNextAction(USER_ID);
      expect(setTimeout).not.toHaveBeenCalled();
    });
  });
});
