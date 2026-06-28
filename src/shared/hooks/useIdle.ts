import { useState, useEffect } from 'react';

/** Returns true after `ms` ms of no pointer/keyboard/scroll activity. */
export function useIdle(ms = 4000): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const reset = () => {
      setIdle(false);
      clearTimeout(t);
      t = setTimeout(() => setIdle(true), ms);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    t = setTimeout(() => setIdle(true), ms);
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(t);
    };
  }, [ms]);
  return idle;
}
