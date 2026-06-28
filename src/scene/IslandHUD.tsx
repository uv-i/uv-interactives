'use client';

import { useIslandStore } from '@/scene/islandStore';

/** Back button + orbit hint shown when the 3D island view is active. */
export function IslandHUD() {
  const isIsland = useIslandStore((s) => s.isIsland);
  const exit = useIslandStore((s) => s.exit);

  if (!isIsland) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-8 z-[60] flex flex-col items-center gap-3 pointer-events-none"
      aria-label="Island mode controls"
    >
      <p className="text-[11px] font-mono uppercase tracking-widest text-pearl/40 select-none">
        Drag to orbit · scroll to zoom
      </p>
      <button
        onClick={exit}
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-violet-night/80 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-pearl/80 backdrop-blur-sm transition-all hover:border-gold/50 hover:text-gold"
        aria-label="Back to site"
      >
        ← Back to site
      </button>
    </div>
  );
}
