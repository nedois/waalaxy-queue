import { useQueueSettings, useUserAccount } from './api';

export function useNextActionStartTime() {
  const { data: settings } = useQueueSettings();
  const { data: user } = useUserAccount();

  if (!user?.lastActionExecutedAt || !settings) {
    return 0;
  }

  const elapsedTime = new Date().getTime() - user.lastActionExecutedAt.getTime();
  const nextActionIn = settings.actionExecutionInterval - elapsedTime;

  return Math.floor(Math.max(nextActionIn, 0) / 1000);
}
