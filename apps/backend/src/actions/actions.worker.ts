import { join } from 'node:path';
import { Worker as NodeWorker, type WorkerOptions as NodeWorkerOptions } from 'node:worker_threads';

import { ActionEvent } from './action.events';
import { database } from '../database/database-instance';
import { type Database } from '../database/types';
import { env } from '../env';

export type BaseWorkerMessage = { actionId: string; type: ActionEvent; context: WorkerContext };

export type WorkerEventHandler<T extends BaseWorkerMessage = any> = (data: T) => void;

export interface WorkerContext {
  database: Database | null;
}

export interface WorkerPostMessage {
  userId: string;
  event: ActionEvent;
  context: WorkerContext;
}

interface WorkerOptions extends NodeWorkerOptions {
  path: string | URL;
  onMessage?: (message: unknown) => void;
  onError?: (error: Error) => void;
  onExit?: (code: number) => void;
}

export class Worker extends NodeWorker {
  private static instance: Worker;

  public static getInstance() {
    if (!Worker.instance) {
      Worker.instance = new Worker({
        path: join(__dirname, './actions.processor'),
        onExit: (code) => console.log(`Worker exited with code ${code}`),
      });
    }

    return this.instance;
  }

  private constructor(readonly options: WorkerOptions) {
    const { path, onMessage, onError, onExit, ...workerOptions } = options;

    super(path, workerOptions);

    this.on('message', (message) => {
      onMessage?.(message);
    });

    this.on('error', (error) => {
      console.log('Worker error:', error);
      onError?.(error);
      this.terminate();
    });

    this.on('exit', async (code) => {
      onExit?.(code);
      this.terminate();
    });
  }

  process(userId: string, event: ActionEvent) {
    this.postMessage({
      userId,
      event,
      context: {
        database: env.DB_TYPE === 'memory' ? database : null,
      },
    });
  }

  subscribe(handler: WorkerEventHandler) {
    this.on('message', handler);
  }

  unsubscribe(handler: WorkerEventHandler) {
    this.off('message', handler);
  }
}
