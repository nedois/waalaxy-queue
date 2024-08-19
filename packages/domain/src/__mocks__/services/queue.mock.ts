import { Action } from '../../entities';
import { Queue } from '../../services/queue';

export class QueueMock extends Queue {
  enqueue = jest.fn<Promise<void>, Parameters<Queue['enqueue']>>();
  remove = jest.fn<Promise<void>, Parameters<Queue['remove']>>();
  peek = jest.fn<Promise<Action[]>, Parameters<Queue['peek']>>();
}
