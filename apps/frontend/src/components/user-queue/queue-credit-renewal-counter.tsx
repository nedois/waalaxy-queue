import { useEffect, useRef } from 'react';
import coinIconUrl from '../../assets/coin-icon.svg';
import { useCountdown, useQueueSettings } from '../../hooks';
import { CountdownCounter } from '../countdown-counter';

export function QueueCreditRenewalCounter() {
  const remainingTimeTextRef = useRef<HTMLSpanElement | null>(null);
  const { data: settings } = useQueueSettings();
  const { assignTextRef, startCountdown, resetCountdown } = useCountdown({ startsAt: 0 });

  assignTextRef(remainingTimeTextRef);

  useEffect(() => {
    const creditsRenewalTime = Math.floor((settings?.timeUntilCreditRenewal ?? 0) / 1000);
    resetCountdown(creditsRenewalTime);
    startCountdown();
  }, [settings?.timeUntilCreditRenewal]);

  return (
    <CountdownCounter
      ref={remainingTimeTextRef}
      message="Credits renews in:"
      icon={<img src={coinIconUrl} alt="Coin" />}
    />
  );
}
