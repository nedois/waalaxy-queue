import { useUserAccount } from './api';

const QUEUE_EXECUTION_INTERVAL_IN_MS = 15000;

export function useNextActionStartTime() {
  const { data: user } = useUserAccount();

  if (!user?.lastActionExecutedAt) {
    return 15;
  }

  const elapsedTime = new Date().getTime() - user.lastActionExecutedAt.getTime();
  const nextActionIn = QUEUE_EXECUTION_INTERVAL_IN_MS - elapsedTime;

  return Math.max(nextActionIn, 0) / 1000;
}
