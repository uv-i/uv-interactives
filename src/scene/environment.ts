import type { ComponentType } from 'react';
import { ArchipelagoScene } from '@/scene/ArchipelagoScene';
import { NarrativeCamera } from '@/scene/NarrativeCamera';
import { ARCH_CAMERA, ARCH_STATIONS, type Station } from '@/scene/archipelago/layout';

/**
 * 3D Environment contract. Swap the whole world by implementing this and
 * re-pointing `activeEnvironment` -- nothing else changes.
 */
export interface SceneEnvironment {
  Scene: ComponentType;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
  stations: Station[];
  /** Optional custom camera (e.g. orbit); replaces the default CameraRig. */
  cameraComponent?: ComponentType;
}

// The single switch point -- change this line to replace the environment.
export const activeEnvironment: SceneEnvironment = {
  Scene: ArchipelagoScene,
  camera: ARCH_CAMERA,
  stations: ARCH_STATIONS,
  cameraComponent: NarrativeCamera,
};
