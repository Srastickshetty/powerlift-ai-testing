import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export function useRestTimer(initialSeconds = 120) {
  const [restSeconds, setRestSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && restSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            toast.info("Rest timer complete! Step up to the bar.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, restSeconds]);

  const startTimer = (seconds = 120) => {
    setRestSeconds(seconds);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const addTime = (delta = 30) => {
    setRestSeconds((prev) => prev + delta);
  };

  const formatted = `${Math.floor(restSeconds / 60)}:${restSeconds % 60 < 10 ? "0" : ""}${restSeconds % 60}`;

  return {
    restSeconds,
    isRunning,
    formatted,
    startTimer,
    toggleTimer,
    addTime
  };
}
