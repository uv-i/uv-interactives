'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useQuality } from '@/shared/providers/QualityProvider';

const MOTION_TAGS = {
  div: motion.div,
  li: motion.li,
  section: motion.section,
} as const;

/**
 * Scroll-reveal wrapper. Fades + lifts content into view once.
 * Skips animation when: prefers-reduced-motion OR 3D disabled (mobile/no-WebGL).
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}) {
  const reduce = useReducedMotion();
  const { enable3D } = useQuality();
  const MotionTag = MOTION_TAGS[as];

  if (reduce || !enable3D) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
