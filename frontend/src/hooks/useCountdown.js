import { useEffect, useMemo, useState } from "react";

export function useCountdown(seconds = 180, enabled = false) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (!enabled) {
      setRemaining(seconds);
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enabled, seconds]);

  const mmss = useMemo(() => {
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [remaining]);

  return { remaining, mmss };
}
