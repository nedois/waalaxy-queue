import { Notifier } from '../../services/notifier';

export class NotifierMock extends Notifier {
  realtime = jest.fn<Promise<void>, Parameters<Notifier['realtime']>>();
}
