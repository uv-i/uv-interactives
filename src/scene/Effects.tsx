'use client';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useQuality } from '@/shared/providers/QualityProvider';

/**
 * Tier-gated post-processing. Bloom gives the cinematic glow (sun glints,
 * lantern, beam); vignette focuses the frame. AA via multisampling on high.
 * Low tier never mounts the canvas, so this only runs on medium/high.
 */
export function Effects() {
  const { tier } = useQuality();
  if (tier === 'low') return null;
  const high = tier === 'high';

  return (
    <EffectComposer multisampling={high ? 4 : 0}>
      <Bloom
        mipmapBlur
        intensity={high ? 0.85 : 0.6}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.25}
      />
      <Vignette offset={0.28} darkness={0.62} eskil={false} />
    </EffectComposer>
  );
}
