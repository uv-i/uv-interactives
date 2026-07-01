'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useQualityStore } from '@/scene/quality/qualityStore';
import { ARCH_ORBIT, responsiveR } from '@/scene/archipelago/layout';

const CENTER = new Vector3(...ARCH_ORBIT.center);

/**
 * Slow cinematic orbit around the archipelago at the hero 3/4 angle.
 * Orbit radius scales with viewport aspect ratio so the island always fills
 * the screen on any device.
 * Edit ARCH_ORBIT in archipelago/layout.ts to adjust H, R, center, fov.
 */
export function ArchipelagoCamera() {
  const { camera, size } = useThree();
  const reducedMotion = useQualityStore((s) => s.reducedMotion);
  const angle = useRef(2.0); // ~front-left start

  useFrame((_, dt) => {
    if (!reducedMotion) angle.current += dt * 0.045;
    const R = responsiveR(size.width, size.height);
    camera.position.set(
      CENTER.x + Math.cos(angle.current) * R,
      ARCH_ORBIT.H,
      CENTER.z + Math.sin(angle.current) * R,
    );
    camera.lookAt(CENTER);
  });

  return null;
}
