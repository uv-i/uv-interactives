'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MeshStandardMaterial, Color, type Mesh, type PointLight } from 'three';
import { useReveal } from '@/scene/reveal/revealStore';
import { ARCH_STAGE, ARCH_MODELS } from '@/scene/archipelago/layout';

// ponytail: clones Bottle_New from cached dock GLB — position/rotation/scale exact match
export function BottlePulse() {
  const ready   = useReveal((s) => s.stage >= ARCH_STAGE.DOCK);
  const { scene } = useGLTF(ARCH_MODELS.dock);
  const lightRef = useRef<PointLight>(null);

  const mat = useMemo(() => new MeshStandardMaterial({
    color:             new Color('#7ec8c8'),
    emissive:          new Color('#00ffcc'),
    emissiveIntensity: 1.0,
    roughness:         0.25,
    metalness:         0.1,
    transparent:       true,
    opacity:           0.55,  // semi-transparent glow shell
  }), []);

  // Clone the mesh node — keeps its baked position + quaternion + scale.
  // Scale up 8% so the glow shell sits outside the original, eliminating z-fighting.
  const clone = useMemo(() => {
    const src = scene.getObjectByName('Bottle_New') as Mesh | undefined;
    if (!src) return null;
    const m = src.clone(false);   // shallow — just the mesh, reuse geometry
    m.scale.multiplyScalar(1.08);
    m.material = mat;
    m.renderOrder = 2;
    return m;
  }, [scene, mat]);

  useFrame(({ clock }) => {
    const t     = clock.getElapsedTime();
    const pulse = 0.6 + 1.9 * (0.5 + 0.5 * Math.sin(t * Math.PI));
    mat.emissiveIntensity = pulse;
    if (lightRef.current) {
      lightRef.current.intensity = 4 + 6 * (0.5 + 0.5 * Math.sin(t * Math.PI));
    }
  });

  if (!ready || !clone) return null;

  return (
    <>
      <primitive object={clone} />
      <pointLight
        ref={lightRef}
        position={[clone.position.x, clone.position.y, clone.position.z]}
        color="#00ffcc"
        intensity={8}
        distance={12}
        decay={2}
      />
    </>
  );
}
