import { Queue } from '../../services/queue';

export class QueueMock extends Queue {
  enqueue = jest.fn<ReturnType<Queue['enqueue']>, Parameters<Queue['enqueue']>>();
  remove = jest.fn<ReturnType<Queue['remove']>, Parameters<Queue['remove']>>();
  peek = jest.fn<ReturnType<Queue['peek']>, Parameters<Queue['peek']>>();
}

export const queueMock = new QueueMock();
