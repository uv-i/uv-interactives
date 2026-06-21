'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/animation/gsap';
import { useScrollStore } from '@/animation/scrollStore';
import { useQuality } from '@/shared/providers/QualityProvider';

/**
 * Lenis smooth-scroll, synced to GSAP ScrollTrigger, feeding the scroll store.
 * Disabled entirely when the user prefers reduced motion (native scroll wins).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const { reducedMotion } = useQuality();
  const setProgress = useScrollStore((s) => s.setProgress);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    const onScroll = () => {
      ScrollTrigger.update();
      setProgress(lenis.progress ?? 0);
    };
    lenis.on('scroll', onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reducedMotion, setProgress]);

  return <>{children}</>;
}
