import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { Notification } from '../../api/entities';
import { env } from '../../env';
import { useUserAccount } from './use-user-account';
interface UseSubscribeToNotificationsOptions {
  onNotification?: (notification: Notification) => void;
}

export function useSubscribeToNotifications(options?: UseSubscribeToNotificationsOptions) {
  const queryClient = useQueryClient();
  const { data: user } = useUserAccount();

  useEffect(() => {
    if (!user) {
      return;
    }

    const eventSource = new EventSource(`${env.VITE_API_URL}/notifications/subscribe?token=${user.id}`);

    eventSource.onmessage = (event) => {
      queryClient.invalidateQueries(['queue']);
      queryClient.invalidateQueries(['actions']);
      queryClient.invalidateQueries(['credits']);

      const notification = Notification.parse(JSON.parse(event.data));
      options?.onNotification?.(notification);
    };

    return () => {
      eventSource.close();
    };
  }, [user?.id]);
}
