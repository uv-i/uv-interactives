'use client';

import dynamic from 'next/dynamic';
import { useQuality } from '@/shared/providers/QualityProvider';
import { useIslandStore } from '@/scene/islandStore';

const SceneCanvas = dynamic(() => import('@/scene/SceneCanvas'), { ssr: false });

export function SceneBackdrop({ className }: { className?: string }) {
  const { enable3D } = useQuality();
  const isIsland = useIslandStore((s) => s.isIsland);

  if (!enable3D) return null;

  const cls = isIsland
    ? 'pointer-events-auto fixed inset-0 z-10'
    : (className ?? 'pointer-events-none fixed inset-0 -z-10');

  return (
    <div className={cls} aria-hidden>
      <SceneCanvas />
    </div>
  );
}
