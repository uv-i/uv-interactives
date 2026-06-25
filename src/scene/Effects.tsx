'use client';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useQualityStore } from '@/scene/quality/qualityStore';
import { useTheme } from '@/scene/theme/themeStore';

/**
 * Post-processing, theme-aware:
 *   dusk  → none (the clean, contrasty night look; also a touch faster)
 *   dawn  → bloom glow + vignette
 * Off entirely on low tier.
 */
export function Effects() {
  const tier = useQualityStore((s) => s.tier);
  const theme = useTheme((s) => s.theme);
  if (tier === 'low' || theme === 'dusk') return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.75} luminanceSmoothing={0.2} />
      <Vignette offset={0.3} darkness={0.55} eskil={false} />
    </EffectComposer>
  );
}
