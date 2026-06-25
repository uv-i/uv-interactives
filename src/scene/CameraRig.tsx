'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useScrollStore } from '@/animation/scrollStore';
import { useQualityStore } from '@/scene/quality/qualityStore';
import { activeEnvironment } from '@/scene/environment';

const pos = new Vector3();
const posB = new Vector3();
const look = new Vector3();
const lookB = new Vector3();

/**
 * Generic camera rig (engine). Flies the camera along the active environment's
 * ordered `stations` driven by scroll progress, with subtle pointer parallax.
 */
export function CameraRig() {
  const { camera } = useThree();
  const reducedMotion = useQualityStore((s) => s.reducedMotion);
  const sp = useRef(0);
  const ptr = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      ptr.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reducedMotion]);

  useFrame((_, dt) => {
    const stations = activeEnvironment.stations;
    if (!stations || stations.length === 0) return;

    const target = reducedMotion ? 0 : useScrollStore.getState().progress;
    sp.current += (target - sp.current) * Math.min(1, dt * 3);
    const t = Math.max(0, Math.min(1, sp.current));

    const n = stations.length;
    const seg = t * (n - 1);
    const i = Math.max(0, Math.min(n - 2, Math.floor(seg)));
    const f = n > 1 ? seg - i : 0;
    const a = stations[i];
    const b = stations[Math.min(n - 1, i + 1)];

    pos.set(a.position[0], a.position[1], a.position[2]).lerp(
      posB.set(b.position[0], b.position[1], b.position[2]),
      f,
    );
    look.set(a.lookAt[0], a.lookAt[1], a.lookAt[2]).lerp(
      lookB.set(b.lookAt[0], b.lookAt[1], b.lookAt[2]),
      f,
    );

    if (!reducedMotion) {
      pos.x += ptr.current.x * 1.5;
      pos.y += ptr.current.y * 0.8;
    }

    camera.position.lerp(pos, Math.min(1, dt * 4));
    camera.lookAt(look);
  });

  return null;
}
