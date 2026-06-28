import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to `target` over `duration` ms when the element
 * enters the viewport. Parses trailing suffix (e.g. "50K+" → suffix "K+").
 * ponytail: one IntersectionObserver, runs once, no library needed.
 */
export function useCountUp(value: string, duration = 1400) {
  const ref = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const match = value.match(/^(\d+(?:\.\d+)?)(.*)/);
    if (!match) { setDisplay(value); return; }
    const target = parseFloat(match[1]);
    const suffix = match[2] ?? '';

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick  = (now: number) => {
        const t    = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 4); // ease-out-quart
        setDisplay(`${Math.round(ease * target)}${suffix}`);
        if (t < 1) requestAnimationFrame(tick);
        else       setDisplay(value);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });

    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  return { ref, display };
}
