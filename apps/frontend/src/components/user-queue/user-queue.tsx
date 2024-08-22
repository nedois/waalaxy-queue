import { useEffect, useMemo, useRef } from 'react';
import {
  useCountdown,
  useNextActionStartTime,
  useQueueSettings,
  useSubscribeToNotifications,
  useUserCredits,
  useUserQueue,
} from '../../hooks';
import { QueueTimer } from './queue-timer';
import { Queue, QueueAction, QueueRoot } from './user-queue.styles';

export function UserQueue() {
  const remainingTimeTextRef = useRef<HTMLSpanElement | null>(null);
  const nextActionStartsAt = useNextActionStartTime();
  const { assignTextRef, startCountdown, resetCountdown } = useCountdown({ startAt: nextActionStartsAt });
  const { data: queue } = useUserQueue();
  const { data: credits } = useUserCredits();
  const { data: settings = { actionExecutionInterval: 15000 } } = useQueueSettings();

  const availableCredits = useMemo(
    () => new Map(credits?.map((credit) => [credit.actionName, credit.amount])),
    [credits]
  );

  assignTextRef(remainingTimeTextRef);

  useSubscribeToNotifications({
    onNotification: (notification) => {
      if (notification.type === 'ACTION_RUNNING') {
        resetCountdown(settings.actionExecutionInterval / 1000);
        startCountdown();
      }
    },
  });

  useEffect(() => {
    resetCountdown(nextActionStartsAt);
    startCountdown();
  }, [nextActionStartsAt]);

  return (
    <QueueRoot>
      <QueueTimer ref={remainingTimeTextRef} />

      <Queue>
        {queue?.map((action) => {
          const availableCredit = availableCredits.get(action.name) ?? 0;
          const isIdle = availableCredit === 0;

          return (
            <QueueAction key={action.id} idle={isIdle} active={action.status === 'RUNNING'}>
              {action.name}
            </QueueAction>
          );
        })}
      </Queue>
    </QueueRoot>
  );
}
