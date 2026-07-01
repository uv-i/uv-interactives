'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

/**
 * Brand loader: starts visible=true on both server and client so the overlay is
 * in the initial HTML — no flash of hero content before the splash appears.
 * useReducedMotion handled in useEffect only to avoid hydration mismatch.
 */
export function LoadingScreen() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduce) {
      setVisible(false);
      return;
    }
    let done = false;
    const dismiss = () => {
      if (!done) { done = true; setVisible(false); }
    };
    const cap = window.setTimeout(dismiss, 1800);
    if (document.readyState === 'complete') {
      window.setTimeout(dismiss, 700);
    } else {
      window.addEventListener('load', () => window.setTimeout(dismiss, 400), { once: true });
    }
    return () => window.clearTimeout(cap);
  }, [reduce]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-violet-night"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-violet-deep via-violet/40 to-transparent"
            initial={{ height: '0%' }}
            animate={{ height: '100%' }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.div
            className="relative drop-shadow-[0_0_40px_rgba(245,166,35,0.45)]"
            initial={{ opacity: 0, scale: 0.86, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <Image src="/uv-logo.png" alt="UV Interactives" width={96} height={96} priority />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
