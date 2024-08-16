import { Notification } from '../entities';

/**
 * Notifier is an abstract class that defines the interface for notifying users
 * about certain events using different channels like email, SMS, or WebSocket for
 * example.
 */
export abstract class Notifier {
  abstract realtime<T>(userId: string, notification: Notification<T>): Promise<void> | void;
}
