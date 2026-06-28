import { useGLTF } from '@react-three/drei';

export const ARCH_MODELS = {
  islands: '/models/archipelago/islands.glb',
  peaks: '/models/archipelago/peaks.glb',
  structures: '/models/archipelago/structures.glb',
  flora: '/models/archipelago/flora.glb',
  dock: '/models/archipelago/dock.glb',
} as const;

export const ARCH_STAGE = {
  ISLANDS: 0,
  PEAKS: 1,
  STRUCTURES: 2,
  FLORA: 3,
  DOCK: 4,
} as const;

export const MAX_STAGE = ARCH_STAGE.DOCK;

export const ARCH_ORBIT = {
  H: 15,
  R: 60,
  center: [2.5, 5, 0] as [number, number, number],
  fov: 52,
};

export const ARCH_CAMERA = {
  position: [
    ARCH_ORBIT.center[0] + Math.cos(2.0) * ARCH_ORBIT.R * 0.2,
    ARCH_ORBIT.H,
    ARCH_ORBIT.center[2] + Math.sin(2.0) * ARCH_ORBIT.R,
  ] as [number, number, number],
  target: ARCH_ORBIT.center,
  fov: ARCH_ORBIT.fov,
};

// Zoom-in target at heroProgress===1. Tweak ZOOM_R_FACTOR + ZOOM_H_DELTA to taste.
// ponytail: only two knobs needed -- don't add more.
const ZOOM_R_FACTOR = 0.75;
const ZOOM_H_DELTA = -5;
export const ARCH_ZOOM_TARGET: [number, number, number] = [
  ARCH_ORBIT.center[0] + Math.cos(2.0) * ARCH_ORBIT.R * 0.2 * ZOOM_R_FACTOR,
  ARCH_ORBIT.H + ZOOM_H_DELTA,
  ARCH_ORBIT.center[2] + Math.sin(2.0) * ARCH_ORBIT.R * ZOOM_R_FACTOR,
];

export interface Station {
  position: [number, number, number];
  lookAt: [number, number, number];
}

export const ARCH_STATIONS: Station[] = [
  { position: ARCH_CAMERA.position, lookAt: ARCH_ORBIT.center },
];

export function preloadArchipelago() {
  Object.values(ARCH_MODELS).forEach((u) => useGLTF.preload(u));
}
