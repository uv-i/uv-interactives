'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuality } from '@/shared/providers/QualityProvider';

/**
 * Additive gold cursor ring that lags the pointer and grows over interactive
 * elements. Fine-pointer devices only; disabled on touch / reduced motion.
 * The native cursor stays visible (accessibility).
 */
export function CustomCursor() {
  const { reducedMotion } = useQuality();
  const [enabled, setEnabled] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;

    setEnabled(true);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let scale = 1;
    let targetScale = 1;
    let raf = 0;
    let seen = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!seen && ringRef.current) {
        seen = true;
        ringRef.current.style.opacity = '1';
      }
    };

    const interactive = (el: EventTarget | null) =>
      el instanceof Element && Boolean(el.closest('a, button, [role="button"], [data-cursor="grow"]'));

    const onOver = (e: MouseEvent) => {
      targetScale = interactive(e.target) ? 2.2 : 1;
    };

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      scale += (targetScale - scale) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, [reducedMotion]);

  if (!enabled) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] h-7 w-7 rounded-full border border-gold/70 opacity-0 transition-opacity duration-300 will-change-transform"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
