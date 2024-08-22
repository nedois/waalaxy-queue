import { useCallback, useRef } from 'react';

export interface UseCountdownOptions {
  /** The countdown start time in seconds */
  startsAt: number;
}

export type UseCountdownReturn = ReturnType<typeof useCountdown>;

/**
 * Reference based countdown hook that avoid rerenders
 */
export function useCountdown({ startsAt }: UseCountdownOptions) {
  const intervalRef = useRef<number | null>(null);
  const textContentRef = useRef<HTMLSpanElement | null>(null);
  const remainingTimeRef = useRef(startsAt);

  const startCountdown = useCallback(() => {
    // Prevent multiple intervals
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (remainingTimeRef.current > 0) {
        remainingTimeRef.current -= 1;

        if (textContentRef.current) {
          textContentRef.current.textContent = `${remainingTimeRef.current} s`;
        }
      } else {
        if (intervalRef.current === null) return;
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);
  }, []);

  const stopCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetCountdown = useCallback(
    (newStartTime?: number) => {
      stopCountdown();
      remainingTimeRef.current = newStartTime ?? startsAt;

      if (textContentRef.current) {
        textContentRef.current.textContent = `${remainingTimeRef.current} s`;
      }
    },
    [startsAt, stopCountdown]
  );

  const assignTextRef = useCallback((ref: typeof textContentRef) => {
    textContentRef.current = ref.current;
  }, []);

  return {
    startCountdown,
    resetCountdown,
    stopCountdown,
    assignTextRef,
  } as const;
}
