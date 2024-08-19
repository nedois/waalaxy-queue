import { forwardRef } from 'react';
import clockIconUrl from '../../../assets/clock-icon.svg';
import { QueueTimerRoot } from './queue-timer.styles';

export const QueueTimer = forwardRef<HTMLSpanElement>((_, ref) => (
  <QueueTimerRoot>
    <img src={clockIconUrl} alt="Horloge" />
    <span>
      Prochaine action dans :{' '}
      <b>
        <span ref={ref} />
      </b>
    </span>
  </QueueTimerRoot>
));
