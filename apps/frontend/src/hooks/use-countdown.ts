import { useEffect, useState } from 'react';

const COUNTDOWN_STEP = 1000;

interface UseCountdownAOptions {
  /** The countdown start time in seconds */
  startTime: number;
  /** The countdown status */
  status?: 'idle' | 'running';
}

export function useCountdown({ startTime, status = 'idle' }: UseCountdownAOptions) {
  const [remainingTime, setRemainingTime] = useState(startTime);
  const [isRunning, setIsRunning] = useState(status === 'running');

  const startCountdown = () => {
    setIsRunning(true);
  };

  const resetCountdown = () => {
    setRemainingTime(startTime);
    setIsRunning(true);
  };

  const stopCountdown = () => {
    setIsRunning(false);
  };

  useEffect(() => {
    if (isRunning) {
      const intervalId = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 0) {
            return 0;
          }

          return prevTime - 1;
        });
      }, COUNTDOWN_STEP);

      return () => clearInterval(intervalId);
    }
  }, [isRunning]);

  return {
    remainingTime,
    isRunning,
    startCountdown,
    resetCountdown,
    stopCountdown,
  };
}
