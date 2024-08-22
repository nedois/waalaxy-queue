import { useMemo } from 'react';
import { useUserCredits, useUserQueue } from '../../hooks';
import { Queue, QueueAction } from './user-queue.styles';

export function UserQueueActions() {
  const { data: queue } = useUserQueue();
  const { data: credits } = useUserCredits();

  const availableCredits = useMemo(
    () => new Map(credits?.map((credit) => [credit.actionName, credit.amount])),
    [credits]
  );

  return (
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
  );
}
