import { useEffect, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { Notification } from '../../api/entities';
import { env } from '../../env';
import { useUserAccount } from './use-user-account';

interface UseSubscribeToNotificationsOptions {
  onNotification?: (notification: Notification) => void;
}

export function useSubscribeToNotifications(options?: UseSubscribeToNotificationsOptions) {
  const queryClient = useQueryClient();
  const onNotificationRef = useRef<UseSubscribeToNotificationsOptions['onNotification']>(options?.onNotification);
  const { data: user } = useUserAccount();

  useEffect(() => {
    onNotificationRef.current = options?.onNotification;
  }, [options?.onNotification]);

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
      onNotificationRef.current?.(notification);
    };

    return () => {
      eventSource.close();
    };
  }, [user?.id]);
}
