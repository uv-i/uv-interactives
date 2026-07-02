'use client';

import { useRef, useEffect, useState, type ReactNode, type CSSProperties } from 'react';

/**
 * Wraps children in a 3-D tilt-on-hover effect.
 * ponytail: CSS transform only, no library needed. Skipped entirely on touch
 * devices (pointer: coarse) — event listeners never attach, zero overhead.
 */
export function TiltWrapper({
  children,
  className,
  max = 10,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(true); // assume touch until checked (SSR-safe)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale(1.02)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: 'transform 0.25s ease', willChange: isTouch ? 'auto' : 'transform' } as CSSProperties}
      onMouseMove={isTouch ? undefined : handleMove}
      onMouseLeave={isTouch ? undefined : handleLeave}
    >
      {children}
    </div>
  );
}
