import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { Notification } from '../../api/entities';
import { env } from '../../env';

interface UseSubscribeToNotificationsOptions {
  onNotification?: (notification: Notification) => void;
}

export function useSubscribeToNotifications(userId: string, options?: UseSubscribeToNotificationsOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource(`${env.VITE_API_URL}/notifications/subscribe`);

    eventSource.onmessage = (event) => {
      queryClient.invalidateQueries();
      const notification = Notification.parse(JSON.parse(event.data));

      options?.onNotification?.(notification);
    };

    return () => {
      eventSource.close();
    };
  }, [userId]);
}
