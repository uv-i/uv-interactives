'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useQuality } from '@/shared/providers/QualityProvider';
import { useIslandStore } from '@/scene/islandStore';
import { MobileBackdrop } from '@/scene/MobileBackdrop';

const SceneCanvas = dynamic(() => import('@/scene/SceneCanvas'), { ssr: false });

export function SceneBackdrop({ className }: { className?: string }) {
  const { enable3D } = useQuality();
  const isIsland = useIslandStore((s) => s.isIsland);
  const pathname = usePathname();

  // Tutorial reading pages (/lab/<topic>...) are flat + fast: no WebGL, no mobile
  // fallback. /lab itself keeps the 3D backdrop (lighthouse camera). Body carries
  // the themed background, so unmounting leaves a clean backdrop.
  if (pathname.startsWith('/lab/')) return null;

  if (!enable3D) return <MobileBackdrop />;

  const cls = isIsland
    ? 'pointer-events-auto fixed inset-0 z-10'
    : (className ?? 'pointer-events-none fixed inset-0 -z-10');

  return (
    <div className={cls} aria-hidden>
      <SceneCanvas />
    </div>
  );
}
