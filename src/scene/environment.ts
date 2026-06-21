import type { ComponentType } from 'react';
import { HarbourScene } from '@/scene/HarbourScene';
import { CAMERA } from '@/scene/layout';

/**
 * 3D Environment contract.
 *
 * The site mounts whatever `activeEnvironment` points to inside a generic
 * canvas. To swap the whole world, implement a new environment that satisfies
 * this interface and re-point `activeEnvironment` — nothing else changes.
 */
export interface SceneEnvironment {
  /**
   * Rendered inside the <Canvas>. Owns everything world-specific: its own
   * lights, models, reveal sequence, sky/fog, and post-processing.
   * Must set its own camera target (e.g. `camera.lookAt(...)`).
   */
  Scene: ComponentType;
  /** Initial hero camera (position + fov used by the canvas; target used by the Scene). */
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
}

// ── The single switch point ──────────────────────────────────────────────
// Change this line (and import a different Scene) to replace the environment.
export const activeEnvironment: SceneEnvironment = {
  Scene: HarbourScene,
  camera: CAMERA,
};
