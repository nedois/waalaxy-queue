import { useRef } from 'react';
import { useNextActionStartTime, useQueueSettings, useSubscribeToNotifications } from '../../hooks';
import { QueueCreditRenewalCounter } from './queue-credit-renewal-counter';
import { QueueNexActionCounter } from './queue-next-action-counter';
import { UserQueueActions } from './user-queue-actions';
import { QueueRoot } from './user-queue.styles';
import { QueueNextActionCounterRef } from './user-queue.types';

export function UserQueue() {
  const nextActionStartsAt = useNextActionStartTime();
  const actionCounterRef = useRef<QueueNextActionCounterRef>(null);
  const { data: settings = { actionExecutionInterval: 15000 } } = useQueueSettings();

  useSubscribeToNotifications({
    onNotification: (notification) => {
      if (notification.type === 'ACTION_RUNNING') {
        actionCounterRef.current?.resetCountdown(settings.actionExecutionInterval / 1000);
        actionCounterRef.current?.startCountdown();
      }
    },
  });

  return (
    <QueueRoot>
      <QueueNexActionCounter ref={actionCounterRef} startsAt={nextActionStartsAt} />
      <UserQueueActions />
      <QueueCreditRenewalCounter />
    </QueueRoot>
  );
}
