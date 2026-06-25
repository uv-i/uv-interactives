import { useGLTF } from '@react-three/drei';

/**
 * Archipelago environment config.
 *
 * The world is exported from Blender as SEPARATE glbs -- one per reveal stage --
 * so each group lazy-loads over the network and animates in on its own.
 * World transforms are baked, so every group mounts at the origin and the
 * pieces line up into the full scene.
 */
export const ARCH_MODELS = {
  islands: '/models/archipelago/islands.glb',
  peaks: '/models/archipelago/peaks.glb',
  structures: '/models/archipelago/structures.glb',
  flora: '/models/archipelago/flora.glb',
  dock: '/models/archipelago/dock.glb',
} as const;

/**
 * Reveal order (maps onto the shared numeric reveal store, 0..4):
 * islands rise from the sea -> mountains -> buildings -> trees (one by one) -> dock.
 */
export const ARCH_STAGE = {
  ISLANDS: 0,
  PEAKS: 1,
  STRUCTURES: 2,
  FLORA: 3,
  DOCK: 4,
} as const;

/** Highest stage index in the current active environment. Update when world changes. */
export const MAX_STAGE = ARCH_STAGE.DOCK;

/**
 * Orbit camera config -- edit HERE, nowhere else.
 *   H      = camera height (y)
 *   R      = orbit radius (distance from centre)
 *   center = world point the camera looks at
 *   fov    = field of view (degrees, lower = more zoomed in)
 */
export const ARCH_ORBIT = {
  H: 22,
  R: 75,
  center: [0, 0, -5] as [number, number, number],
  fov: 38,
};

/** Derived -- don't edit directly, change ARCH_ORBIT above. */
export const ARCH_CAMERA = {
  position: [
    ARCH_ORBIT.center[0] + Math.cos(2.0) * ARCH_ORBIT.R,
    ARCH_ORBIT.H,
    ARCH_ORBIT.center[2] + Math.sin(2.0) * ARCH_ORBIT.R,
  ] as [number, number, number],
  target: ARCH_ORBIT.center,
  fov: ARCH_ORBIT.fov,
};

/** A scroll waypoint the camera rig flies between (scroll 0 to 1). */
export interface Station {
  position: [number, number, number];
  lookAt: [number, number, number];
}

/** Single station -- orbit camera drives movement, rig unused. */
export const ARCH_STATIONS: Station[] = [
  { position: ARCH_CAMERA.position, lookAt: ARCH_ORBIT.center },
];

export function preloadArchipelago() {
  Object.values(ARCH_MODELS).forEach((u) => useGLTF.preload(u));
}
