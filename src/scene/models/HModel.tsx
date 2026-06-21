'use client';

import { useEffect } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { NearestFilter, type Object3D, type Mesh } from 'three';

type Vec3 = [number, number, number];

/**
 * Loads a glb and clones it (so the same asset can be placed multiple times).
 * Forces NearestFilter on the palette atlas so the color swatches stay crisp.
 */
export function HModel({
  url,
  position,
  rotation,
  scale,
}: {
  url: string;
  position?: Vec3;
  rotation?: Vec3;
  scale?: number | Vec3;
}) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((o: Object3D) => {
      const mesh = o as Mesh;
      if (mesh.isMesh && mesh.material) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const mat = mesh.material as unknown as {
          map?: { magFilter: number; minFilter: number; generateMipmaps: boolean; needsUpdate: boolean };
          roughness?: number;
        };
        if (mat.map) {
          mat.map.magFilter = NearestFilter;
          mat.map.minFilter = NearestFilter;
          mat.map.generateMipmaps = false;
          mat.map.needsUpdate = true;
        }
        if (typeof mat.roughness === 'number') mat.roughness = 0.78;
      }
    });
  }, [scene]);

  return <Clone object={scene} position={position} rotation={rotation} scale={scale} />;
}
