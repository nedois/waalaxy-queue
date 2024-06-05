import { join } from 'node:path';
import { Worker as NodeWorker, type WorkerOptions as NodeWorkerOptions } from 'node:worker_threads';

import { ActionEvent } from './action.events';
import { type Database, database } from '../database';

export type BaseWorkerMessage = { actionId: string; type: ActionEvent; context: WorkerContext };

export type WorkerEventHandler = <T extends BaseWorkerMessage>(data: T) => void;

export interface WorkerContext {
  database: Database;
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

    super.on('message', (message) => {
      onMessage?.(message);
    });

    super.on('error', (error) => {
      onError?.(error);
      super.terminate();
    });

    super.on('exit', async (code) => {
      onExit?.(code);
      super.terminate();
    });
  }

  process(userId: string, event: ActionEvent) {
    super.postMessage({ userId, event, context: { database } });
  }

  subscribe(handler: WorkerEventHandler) {
    super.on('message', handler);
  }

  unsubscribe(handler: WorkerEventHandler) {
    super.off('message', handler);
  }
}
