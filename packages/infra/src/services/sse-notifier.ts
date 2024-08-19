import { Notifier, type Notification } from '@repo/domain';
import type { Request, Response } from 'express';

export class SSENotifier extends Notifier {
  private response: Response | null = null;

  private request: Request | null = null;

  /**  Subscribe to notifications for the current user. */
  subscribe(request: Request, response: Response) {
    this.request = request;
    this.response = response;

    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    request.on('close', () => {
      response.end();
    });
  }

  realtime<T>(userId: string, notification: Notification<T>) {
    if (!this.response || !this.request) {
      console.log(`No active connection for user "${userId}"`);
      return;
    }

    // Prevent sending notifications if the user is not the owner of the notification
    if (this.request.user.id === userId) {
      this.response.write(`data: ${JSON.stringify(notification)}\n\n`);
    }
  }
}
