import { useEffect, useState } from 'react';

export interface UseCountdownResult {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: (next?: number) => void;
}

export function useCountdown(initialSeconds: number): UseCountdownResult {
  const [seconds, setSeconds] = useState(Math.max(0, Math.floor(initialSeconds)));
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      setSeconds((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    if (seconds === 0) {
      setIsRunning(false);
    }
  }, [seconds]);

  const start = () => {
    if (seconds > 0) setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const reset = (next?: number) => {
    setIsRunning(false);
    setSeconds(Math.max(0, Math.floor(next ?? initialSeconds)));
  };

  return { seconds, isRunning, start, pause, reset };
}
