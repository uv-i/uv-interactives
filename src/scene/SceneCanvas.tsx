'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import { activeEnvironment } from '@/scene/environment';
import { CameraRig } from '@/scene/CameraRig';
import { DebugCamera } from '@/scene/DebugCamera';
import { PerfProbe } from '@/scene/debug/PerfProbe';
import { isDebug } from '@/scene/debug/perfStore';
import { useQuality } from '@/shared/providers/QualityProvider';

const DEBUG_CAM =
  process.env.NODE_ENV === 'development' &&
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('cam');

/** Generic WebGL canvas (the "engine"). Renders whatever environment is active. */
export default function SceneCanvas() {
  const { tier } = useQuality();
  const dpr: [number, number] = tier === 'high' ? [1, 1.5] : [1, 1.25];
  const { Scene, camera, cameraComponent: CameraComponent } = activeEnvironment;
  const debug = isDebug();

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
        {DEBUG_CAM ? (
          <DebugCamera target={camera.target} />
        ) : CameraComponent ? (
          <CameraComponent />
        ) : (
          <CameraRig />
        )}
        {debug ? <PerfProbe /> : null}
      </Suspense>
    </Canvas>
  );
}
