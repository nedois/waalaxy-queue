import { Notifier } from '../../services/notifier';

export class NotifierMock extends Notifier {
  realtime = jest.fn<ReturnType<Notifier['realtime']>, Parameters<Notifier['realtime']>>();
}

export const notifierMock = new NotifierMock();
