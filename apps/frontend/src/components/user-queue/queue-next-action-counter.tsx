import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import clockIconUrl from '../../assets/clock-icon.svg';
import { useCountdown } from '../../hooks';
import { CountdownCounter } from '../countdown-counter';
import type { QueueNextActionCounterProps, QueueNextActionCounterRef } from './user-queue.types';

export const QueueNexActionCounter = forwardRef<QueueNextActionCounterRef, QueueNextActionCounterProps>(
  ({ startsAt }, outerRef) => {
    const remainingTimeTextRef = useRef<HTMLSpanElement | null>(null);
    const { assignTextRef, startCountdown, resetCountdown } = useCountdown({ startsAt });

    assignTextRef(remainingTimeTextRef);

    useEffect(() => {
      resetCountdown(startsAt);
      startCountdown();
    }, [startsAt]);

    useImperativeHandle(
      outerRef,
      () => ({
        startCountdown,
        resetCountdown,
      }),
      [startCountdown, resetCountdown]
    );

    return (
      <CountdownCounter
        ref={remainingTimeTextRef}
        message="Next action in:"
        icon={<img src={clockIconUrl} alt="Horloge" />}
      />
    );
  }
);
