import { Notifier, type Notification } from '@repo/domain';

export class SSENotifier extends Notifier {
  realtime<T>(userId: string, notification: Notification<T>) {
    console.log(`Sending notification to user ${userId}: ${notification.message}`);
  }
}
