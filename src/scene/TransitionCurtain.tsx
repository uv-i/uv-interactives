'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useIslandStore } from '@/scene/islandStore';

export function TransitionCurtain() {
  const transitioning = useIslandStore((s) => s.transitioning);

  return (
    <AnimatePresence>
      {transitioning && (
        <motion.div
          key="curtain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, #1a0b2e 0%, #07060f 100%)',
          }}
          aria-hidden
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: [0, 1, 0.7], scale: [0.85, 1.0, 0.95] }}
            transition={{ duration: 0.5, times: [0, 0.5, 1] }}
            style={{
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.35em',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              color: 'rgba(136,85,255,0.9)',
              textShadow: '0 0 24px rgba(136,85,255,0.6)',
            }}
          >
            ◈ UV INTERACTIVES
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
