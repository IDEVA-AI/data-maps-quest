import { useState, useEffect, useCallback } from "react";

interface UseRateLimitReturn {
  isInCooldown: boolean;
  remainingTime: number;
  startCooldown: (seconds: number) => void;
}

export const useRateLimit = (defaultCooldownSeconds: number = 60): UseRateLimitReturn => {
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const startCooldown = useCallback((seconds: number) => {
    setIsInCooldown(true);
    setRemainingTime(seconds);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isInCooldown && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsInCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isInCooldown, remainingTime]);

  return {
    isInCooldown,
    remainingTime,
    startCooldown,
  };
};