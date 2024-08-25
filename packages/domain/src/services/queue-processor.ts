import assert from 'node:assert';
import { actionHandlers } from '../action-handlers';
import { CreditDomainService } from '../domain-services';
import { Action, Credit, Notification, User } from '../entities';
import {
  ActionHandlerNotFoundException,
  EntityNotFoundException,
  QueueProcessorNotInitializedException,
} from '../exceptions';
import { ActionRepository, CreditRepository, UserRepository } from '../repositories';
import { Notifier } from './notifier';
import { Queue } from './queue';

export interface QueueProcessorOptions {
  /**  Interval to renew the user's credits (in ms) */
  renewalCreditsInterval: number;

  /** Interval to execute the next action (in ms) */
  actionExecutionInterval: number;
}

export class QueueProcessor {
  readonly CREDITS_RENEWAL_INTERVAL: number;

  readonly ACTION_EXECUTION_INTERVAL: number;

  /** Maximum elapsed time to lock the user queue (in ms) */
  private readonly QUEUE_LOCK_THRESHOLD: number;

  private renewalCreditsInterval: NodeJS.Timeout | null = null;

  private queueTimeouts = new Map<string, NodeJS.Timeout>();

  initializedAt: Date | null = null;

  isShuttingDown = false;

  constructor(
    options: QueueProcessorOptions,
    private readonly queue: Queue,
    private readonly actionRepository: ActionRepository,
    private readonly creditRepository: CreditRepository,
    private readonly userRepository: UserRepository,
    private readonly notifier: Notifier,
    private readonly creditDomainService: CreditDomainService
  ) {
    this.CREDITS_RENEWAL_INTERVAL = options.renewalCreditsInterval;
    this.ACTION_EXECUTION_INTERVAL = options.actionExecutionInterval;
    this.QUEUE_LOCK_THRESHOLD = this.ACTION_EXECUTION_INTERVAL;
  }

  get isInitialized() {
    return this.initializedAt !== null;
  }

  /**
   * Initializes the QueueProcessor by starting all user queues and
   * setting up the renewal credits interval.
   */
  async initialize() {
    if (this.isInitialized || this.isShuttingDown) {
      return;
    }

    this.initializedAt = new Date();

    await this.startAllUsersQueue();
    this.initializeRenewalCreditsInterval();
  }

  /**
   * Stop the queue processor gracefully.
   * This method should be called during the application shutdown to ensure
   * all the RUNNING actions to be completed before stopping.
   */
  async stop() {
    this.isShuttingDown = true;
    this.stopRenewalCreditsInterval();
    this.handleShutdown();
  }

  /** Adds a new action to the user's queue and schedules it for execution. */
  async enqueueAction(action: Action) {
    assert(this.isInitialized, new QueueProcessorNotInitializedException());

    await this.queue.enqueue(action);
    await this.scheduleNextAction(action.userId);
  }

  get msUntilCreditRenewal() {
    if (!this.renewalCreditsInterval || !this.initializedAt) {
      return null;
    }

    const elapsedTime = new Date().getTime() - this.initializedAt.getTime();
    const timeSinceLastRenewal = elapsedTime % this.CREDITS_RENEWAL_INTERVAL;

    return this.CREDITS_RENEWAL_INTERVAL - timeSinceLastRenewal;
  }

  getSettings() {
    return {
      timeUntilCreditRenewal: this.msUntilCreditRenewal,
      creditRenewalInterval: this.CREDITS_RENEWAL_INTERVAL,
      actionExecutionInterval: this.ACTION_EXECUTION_INTERVAL,
    };
  }

  /** Determines the next action that can be executed based on the user's credits. */
  private async getNextExecutableAction(userId: string) {
    const credits = await this.creditRepository.findByUserId(userId);
    const creditsMap = new Map(credits.map((credit) => [credit.actionName, credit]));

    const actions = await this.queue.peek(userId);

    const nextAction = actions.find((action) => {
      const actionCredit = creditsMap.get(action.name);
      assert(actionCredit, new EntityNotFoundException(Credit, action.name));
      const hasEnoughCredits = actionCredit.amount > 0;
      const isStale = this.isActionStale(action);
      return hasEnoughCredits && isStale;
    });

    return nextAction ?? null;
  }

  /**
   * Determines if an action is stale based on the elapsed time since it was
   * last executed. An action is considered stale if it has not been completed
   * and the elapsed time is greater than the QUEUE_LOCK_THRESHOLD.
   * PENDING actions are considered stale by default.
   */
  private isActionStale(action: Action) {
    if (action.status === 'COMPLETED') {
      return false;
    }

    if (!action.runnedAt) {
      return true;
    }

    const elapsedTime = new Date().getTime() - action.runnedAt.getTime();
    return elapsedTime > this.QUEUE_LOCK_THRESHOLD;
  }

  private async notifyActionCompletion(action: Action) {
    await this.notifier.realtime(
      action.userId,
      new Notification({
        id: Notification.generateId(),
        type: 'ACTION_COMPLETED',
        message: `Action ${action.name} completed`,
        payload: action,
      })
    );
  }

  private async decrementUserCredit(action: Action) {
    const credit = await this.creditRepository.findOneByUserIdAndActionName(action.userId, action.name);
    assert(credit, new EntityNotFoundException(Credit, action.name));

    credit.amount -= 1;
    return this.creditRepository.save(credit);
  }

  private async markActionAsCompleted(action: Action) {
    action.status = 'COMPLETED';
    return this.actionRepository.save(action);
  }

  /**
   * Handles the completion of an action by:
   * - Updating the action status to 'COMPLETED'
   * - Decreasing the user's credit by 1
   * - Unlocking the user queue
   * - Notifying the user
   * - Removing the action from the queue
   * - Scheduling the next action for the user
   */
  private async onActionCompleted(action: Action) {
    const user = await this.userRepository.findOne(action.userId);
    assert(user, new EntityNotFoundException(User, action.userId));

    await this.decrementUserCredit(action);
    await this.unlockUserQueue(user);
    await this.markActionAsCompleted(action);
    await this.notifyActionCompletion(action);
    await this.queue.remove(action);
    await this.scheduleNextAction(action.userId);
  }

  /**
   * Prepares an action for execution by:
   * - Updating its status to 'RUNNING'
   * - Recording the run start time
   * - Updating the user's last action executed time
   */
  private async prepareActionForExecution(action: Action, user: User) {
    action.status = 'RUNNING';
    action.runnedAt = new Date();
    user.lastActionExecutedAt = new Date();

    await Promise.all([this.userRepository.save(user), this.actionRepository.save(action)]);
  }

  private async notifyActionRunning(action: Action) {
    await this.notifier.realtime(
      action.userId,
      new Notification({
        id: Notification.generateId(),
        type: 'ACTION_RUNNING',
        message: `Action ${action.name} is running`,
        payload: action,
      })
    );
  }

  private async notifyInCreditRenewal(userId: string) {
    await this.notifier.realtime(
      userId,
      new Notification({
        id: Notification.generateId(),
        type: 'CREDIT_RENEWAL',
        message: 'Credits are being renewed',
      })
    );
  }

  private async runActionHandler(action: Action) {
    const ActionHandler = actionHandlers.find((handler) => handler.actionName === action.name);
    assert(ActionHandler, new ActionHandlerNotFoundException(action.name));

    await new ActionHandler().execute();
  }

  /**
   * Executes an action by:
   * - Preparing the action and user for execution
   * - Notifying the user that the action is running
   * - Running the action handler
   * - Handling the completion of the action
   */
  private async executeAction(action: Action, user: User) {
    await this.prepareActionForExecution(action, user);
    await this.notifyActionRunning(action);
    await this.runActionHandler(action);
    await this.onActionCompleted(action);
  }

  /** Determines if there are running tasks in any queue */
  private hasRunningTasks() {
    return this.queueTimeouts.size > 0;
  }

  /**
   * Handles the shutdown process by:
   * - Marking the processor as stopped if there are no running tasks
   * - Clearing any scheduled timeouts for the user if provided
   */
  private handleShutdown(userId?: string) {
    if (userId) {
      // Prevent scheduling a new task for this user and cleanup current
      // user interval
      this.clearTimeout(userId);
    }

    // Mark processor has stopped if there is not running task
    if (!this.hasRunningTasks()) {
      this.initializedAt = null;
      this.isShuttingDown = false;
    }
  }

  private async loadAndValidateUser(userId: string) {
    const user = await this.userRepository.findOne(userId);
    assert(user, new EntityNotFoundException(User, userId));

    return this.revalidateUserLock(user);
  }

  private async lockUserQueue(user: User) {
    user.lockedQueueAt = new Date();
    return this.userRepository.save(user);
  }

  private async unlockUserQueue(user: User) {
    user.lockedQueueAt = null;
    return this.userRepository.save(user);
  }

  private scheduleActionExecution(action: Action, user: User) {
    const timeout = setTimeout(
      async () => await this.executeAction(action, user),
      this.calculateNextActionExecutionTime(user)
    );

    // Save the timeout to clear it later
    this.queueTimeouts.set(user.id, timeout);
  }

  /** Schedule the next action to run in the next ACTION_EXECUTION_INTERVAL */
  private async scheduleNextAction(userId: string) {
    if (this.isShuttingDown) {
      return this.handleShutdown(userId);
    }

    let user = await this.loadAndValidateUser(userId);

    // If the user is locked, we'll try again in the next interval
    if (user.isQueueLocked()) return;

    const nextAction = await this.getNextExecutableAction(userId);

    // Destroy the timeout if the user has no more actions
    if (!nextAction) {
      return this.clearTimeout(userId);
    }

    // Lock the user to avoid processing workers to execute the same
    // action queue at the same time
    user = await this.lockUserQueue(user);

    // Get the execution time for the next action
    // and execute the action after the time has passed
    this.scheduleActionExecution(nextAction, user);
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
      await this.unlockUserQueue(user);
    }

    return user;
  }

  private initializeRenewalCreditsInterval() {
    // We spect less than 50 users in the database
    // so we'll renew all credits at once instead
    // of chunking the users for simplicity
    this.renewalCreditsInterval = setInterval(async () => {
      const users = await this.userRepository.find();
      const userRenewalsPromises = users.map((user) =>
        Promise.all([this.creditDomainService.recalculateUserCredits(user.id), this.notifyInCreditRenewal(user.id)])
      );

      await Promise.all(userRenewalsPromises);
      await Promise.all(users.map((user) => this.scheduleNextAction(user.id)));
    }, this.CREDITS_RENEWAL_INTERVAL);
  }

  /**
   * Calculate the next action execution time based on the user's
   * last action executed time and the defined  action execution interval.
   */
  private calculateNextActionExecutionTime(user: User) {
    if (!user.lastActionExecutedAt) {
      return 0;
    }

    const elapsedTime = new Date().getTime() - user.lastActionExecutedAt.getTime();
    const nextActionIn = this.ACTION_EXECUTION_INTERVAL - elapsedTime;
    return Math.floor(Math.max(nextActionIn, 0));
  }

  /**  Starts processing actions for all users by scheduling their next actions. */
  private async startAllUsersQueue() {
    const users = await this.userRepository.find();
    await Promise.all(users.map((user) => this.scheduleNextAction(user.id)));
  }

  private stopRenewalCreditsInterval() {
    if (this.renewalCreditsInterval) {
      clearInterval(this.renewalCreditsInterval);
      this.renewalCreditsInterval = null;
    }
  }
}
