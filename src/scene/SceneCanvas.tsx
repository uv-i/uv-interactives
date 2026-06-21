'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import { activeEnvironment } from '@/scene/environment';
import { useQuality } from '@/shared/providers/QualityProvider';

/**
 * Generic WebGL canvas (the "engine"). Renders whatever environment is active.
 * Default-exported for lazy next/dynamic({ ssr:false }).
 */
export default function SceneCanvas() {
  const { tier } = useQuality();
  const dpr: [number, number] = tier === 'high' ? [1, 2] : [1, 1.5];
  const { Scene, camera } = activeEnvironment;

  return (
    <Canvas
      shadows
      dpr={dpr}
      gl={{
        antialias: tier !== 'low',
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{ position: camera.position, fov: camera.fov }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
