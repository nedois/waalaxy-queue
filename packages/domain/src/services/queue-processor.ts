import assert from 'node:assert';
import { actionHandlers } from '../action-handlers';
import { CreditDomainService } from '../domain-services';
import { Action, Notification, User } from '../entities';
import { ActionRepository, CreditRepository, UserRepository } from '../repositories';
import { Notifier } from './notifier';
import { Queue } from './queue';

export interface QueueProcessorOptions {
  /**  Interval to renew the user's credits (in ms) */
  renewalCreditsInterval: number;

  /** Interval to execute the next action (in ms) */
  actionExecutionInterval: number;
}

export abstract class QueueProcessor {
  private readonly RENEWAL_CREDITS_INTERVAL: number;

  private readonly ACTION_EXECUTION_INTERVAL: number;

  /** Maximum elapsed time to lock the user queue (in ms) */
  private readonly QUEUE_LOCK_THRESHOLD: number;

  private renewalCreditsInterval: NodeJS.Timeout | null = null;

  private queueTimeouts = new Map<string, NodeJS.Timeout>();

  private isShuttingDown = false;

  private initiliazed = false;

  constructor(
    options: QueueProcessorOptions,
    protected readonly queue: Queue,
    protected readonly actionRepository: ActionRepository,
    protected readonly creditRepository: CreditRepository,
    protected readonly userRepository: UserRepository,
    protected readonly notifier: Notifier,
    protected readonly creditDomainService: CreditDomainService
  ) {
    this.RENEWAL_CREDITS_INTERVAL = options.renewalCreditsInterval;
    this.ACTION_EXECUTION_INTERVAL = options.actionExecutionInterval;
    this.QUEUE_LOCK_THRESHOLD = this.ACTION_EXECUTION_INTERVAL;
  }

  /** Initialize the queue processor and all user queues */
  async initialize() {
    this.initiliazed = true;

    await this.prepareUserQueues();

    const users = await this.userRepository.find();
    await Promise.all(users.map((user) => this.scheduleNextAction(user.id)));

    this.initializeRenewalCreditsInterval();
  }

  /** Enqueue user actions from the persistance */
  abstract prepareUserQueues(): Promise<void> | void;

  /**
   * Stop the queue processor gracefully.
   * This method should be called when the application is shutting down.
   * It should wait for all the pending actions to be completed before stopping.
   */
  async stop() {
    if (this.renewalCreditsInterval) {
      clearInterval(this.renewalCreditsInterval);
    }

    this.clearTimeouts();
  }

  async getUserQueue(userId: string) {
    return this.queue.peek(userId);
  }

  /**
   * Enqueue an action to the user queue.
   * The action will be executed in the next available slot.
   */
  async enqueueAction(action: Action) {
    await this.queue.enqueue(action);
    await this.scheduleNextAction(action.userId);
  }

  /** Get the next executable action based on the user's credit */
  protected async getNextExecutableAction(userId: string) {
    const credits = await this.creditRepository.findByUserId(userId);
    const creditsMap = new Map(credits.map((credit) => [credit.actionName, credit]));

    const actions = await this.queue.peek(userId);

    const nextAction = actions.find((action) => {
      const actionCredit = creditsMap.get(action.name);
      assert(actionCredit, '[ Internal Error ] Credit not found');
      return actionCredit.amount > 0;
    });

    return nextAction ?? null;
  }

  /**
   * On action completed:
   * - Update the action status to 'COMPLETED'
   * - Decrease the user's credit by 1
   * - Unlock the user queue
   * - Notify the user
   * - Dequeue the current action
   */
  protected async onActionCompleted(action: Action) {
    const [credit, user] = await Promise.all([
      this.creditRepository.findOneByUserIdAndActionName(action.userId, action.name),
      this.userRepository.findOne(action.userId),
    ]);

    assert(user, '[ Internal Error ] User not found');

    credit.amount -= 1;
    action.status = 'COMPLETED';
    user.lockedQueueAt = null;

    await Promise.all([
      this.actionRepository.save(action),
      this.creditRepository.save(credit),
      this.userRepository.save(user),
    ]);

    await this.notifier.realtime(
      action.userId,
      new Notification({
        id: Notification.generateId(),
        type: 'ACTION_COMPLETED',
        message: `Action ${action.name} completed`,
        payload: action,
      })
    );

    await this.queue.remove(action);

    // Schedule the next action
    await this.scheduleNextAction(action.userId);
  }

  /**
   * Execute the action:
   * - Notify the user that the action is running
   * - Update the action status to 'RUNNING'
   * - Execute the action handler
   */
  protected async executeAction(action: Action, user: User) {
    action.status = 'RUNNING';
    action.runnedAt = new Date();
    user.lastActionExecutedAt = new Date();

    await Promise.all([
      this.userRepository.save(user),
      this.actionRepository.save(action),
      this.notifier.realtime(
        action.userId,
        new Notification({
          id: Notification.generateId(),
          type: 'ACTION_RUNNING',
          message: `Action ${action.name} is running`,
          payload: action,
        })
      ),
    ]);

    const ActionHandler = actionHandlers.find((handler) => handler.actionName === action.name);
    assert(ActionHandler, `[ Internal Error ] Action handler not found for ${action.name}`);

    await new ActionHandler().execute();

    await this.onActionCompleted(action);
  }

  /** Schedule the next action to run in the next ACTION_EXECUTION_INTERVAL */
  protected async scheduleNextAction(userId: string) {
    assert(this.initiliazed, '[ Internal Error ] Queue processor not initialized');

    if (this.isShuttingDown) {
      // Last task finished, we can stop this user queue
      return this.clearTimeout(userId);
    }

    let user = await this.userRepository.findOne(userId);
    assert(user, '[ Internal Error ] User not found');

    user = await this.revalidateUserLock(user);

    // If the user is locked, we'll try again in the next interval
    if (user.lockedQueueAt) {
      return;
    }

    const nextAction = await this.getNextExecutableAction(userId);

    // Destroy the timeout if the user has no more actions
    if (!nextAction) {
      return this.clearTimeout(userId);
    }

    // Lock the user to avoid processing workers to execute the same
    // action queue at the same time
    user.lockedQueueAt = new Date();
    await this.userRepository.save(user);

    // Get the execution time for the next action
    // and execute the action after the time has passed
    const timeout = setTimeout(() => this.executeAction(nextAction, user), this.calculateNextActionExecutionTime(user));

    // Save the timeout to clear it later
    this.queueTimeouts.set(userId, timeout);
  }

  private clearTimeouts() {
    for (const timeout of this.queueTimeouts.values()) {
      clearTimeout(timeout);
    }
  }

  /** Clear the timeout for the user, to prevent memory leaks */
  private clearTimeout(userId: string) {
    const timeout = this.queueTimeouts.get(userId);

    if (timeout) {
      clearTimeout(timeout);
      this.queueTimeouts.delete(userId);
    }
  }

  /**
   * Revalidate the user's lock and unlock the queue if the elapsed time
   * is greater than the threshold. Queue lock can be stale in case of
   * unexpected shutdowns.
   * */
  private async revalidateUserLock(user: User) {
    if (!user.lockedQueueAt) {
      return user;
    }

    const elapsedTime = new Date().getTime() - user.lockedQueueAt.getTime();

    if (elapsedTime > this.QUEUE_LOCK_THRESHOLD) {
      user.lockedQueueAt = null;
      await this.userRepository.save(user);
    }

    return user;
  }

  private initializeRenewalCreditsInterval() {
    // We spect less than 50 users in the database
    // so we'll renew all credits at once instead
    // of chunking the users for simplicity
    this.renewalCreditsInterval = setInterval(async () => {
      const users = await this.userRepository.find();
      await Promise.all(users.map((user) => this.creditDomainService.recalculateUserCredits(user.id)));
      await Promise.all(users.map((user) => this.scheduleNextAction(user.id)));
    }, this.RENEWAL_CREDITS_INTERVAL);
  }

  /**
   * Calculate the next action execution time based on the user's
   * last action executed time and the action execution interval.
   */
  private calculateNextActionExecutionTime(user: User) {
    if (!user.lastActionExecutedAt) {
      return 0;
    }

    const elapsedTime = new Date().getTime() - user.lastActionExecutedAt.getTime();
    const nextActionIn = this.ACTION_EXECUTION_INTERVAL - elapsedTime;
    return Math.floor(Math.max(nextActionIn, 0));
  }
}
