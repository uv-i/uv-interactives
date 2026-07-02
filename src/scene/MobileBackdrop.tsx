'use client';

import { useTheme } from '@/scene/theme/themeStore';

/**
 * Rich static brand backdrop for when WebGL is unavailable (mobile/no-WebGL).
 * Three layered radial orbs + dot grid. No animation — cheap CSS only.
 * ponytail: CSS-only, no JS animation loop, compositor-layer isolated.
 */
export function MobileBackdrop() {
  const isDawn = useTheme((s) => s.resolved === 'dawn');

  return (
    <div
      aria-hidden
      className="mobile-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -10,
        overflow: 'hidden',
      }}
    >
      {/* Primary orb — top-right anchor */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-10%',
        width: '75vw',
        height: '75vw',
        borderRadius: '50%',
        background: isDawn
          ? 'radial-gradient(circle, rgba(215,155,40,0.30) 0%, transparent 68%)'
          : 'radial-gradient(circle, rgba(99,32,238,0.55) 0%, transparent 68%)',
        filter: 'blur(48px)',
      }} />

      {/* Secondary orb — bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: '5%',
        left: '-12%',
        width: '65vw',
        height: '65vw',
        borderRadius: '50%',
        background: isDawn
          ? 'radial-gradient(circle, rgba(255,195,80,0.22) 0%, transparent 68%)'
          : 'radial-gradient(circle, rgba(245,166,35,0.22) 0%, transparent 68%)',
        filter: 'blur(56px)',
      }} />

      {/* Accent orb — mid-left */}
      <div style={{
        position: 'absolute',
        top: '38%',
        left: '8%',
        width: '45vw',
        height: '45vw',
        borderRadius: '50%',
        background: isDawn
          ? 'radial-gradient(circle, rgba(180,130,40,0.14) 0%, transparent 68%)'
          : 'radial-gradient(circle, rgba(58,12,163,0.40) 0%, transparent 68%)',
        filter: 'blur(36px)',
      }} />

      {/* Subtle dot grid — fades toward edges */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle, ${
          isDawn ? 'rgba(130,90,20,0.14)' : 'rgba(99,32,238,0.18)'
        } 1px, transparent 1px)`,
        backgroundSize: '26px 26px',
        maskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, black 10%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 50%, black 10%, transparent 75%)',
      }} />

      {/* Top vignette — softens the orb edge against the navbar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '120px',
        background: isDawn
          ? 'linear-gradient(to bottom, rgba(242,232,213,0.6), transparent)'
          : 'linear-gradient(to bottom, rgba(8,2,21,0.7), transparent)',
      }} />
    </div>
  );
}
