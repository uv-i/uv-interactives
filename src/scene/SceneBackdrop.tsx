'use client';

import dynamic from 'next/dynamic';
import { useQuality } from '@/shared/providers/QualityProvider';

// Lazy, client-only — never server-rendered, only mounted on capable devices.
const SceneCanvas = dynamic(() => import('@/scene/SceneCanvas'), { ssr: false });

/**
 * Generic 3D backdrop mount. Renders nothing on low-tier / reduced-motion
 * devices (the CSS gradient behind the hero is the graceful fallback).
 * Environment-agnostic: it just hosts whatever `activeEnvironment` is.
 */
export function SceneBackdrop({ className }: { className?: string }) {
  const { enable3D } = useQuality();
  if (!enable3D) return null;
  return (
    <div className={className} aria-hidden>
      <SceneCanvas />
    </div>
  );
}
