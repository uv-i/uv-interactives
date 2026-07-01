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

// Scroll-zoom knobs — only two, don't add more.
const ZOOM_R_FACTOR = 0.75;
const ZOOM_H_DELTA  = -5;

export const ARCH_ZOOM_TARGET: [number, number, number] = [
  ARCH_ORBIT.center[0] + Math.cos(2.0) * ARCH_ORBIT.R * 0.2 * ZOOM_R_FACTOR,
  ARCH_ORBIT.H + ZOOM_H_DELTA,
  ARCH_ORBIT.center[2] + Math.sin(2.0) * ARCH_ORBIT.R * ZOOM_R_FACTOR,
];

// ─── Responsive camera helpers ───────────────────────────────────────────────

// Base calibrated at 16:9 desktop. On narrower viewports, HFOV shrinks and the
// camera must pull back so the island still fills the screen.
// Math: at fixed VFOV, horizontal coverage ∝ aspect, so D ∝ 1/aspect.
// → R_new = R_base × (16/9) / aspect
const BASE_ASPECT = 16 / 9;

/** Orbit radius that keeps the island filling the viewport at any aspect ratio. */
export function responsiveR(width: number, height: number): number {
  if (!width || !height) return ARCH_ORBIT.R;
  const scale = BASE_ASPECT / (width / height);
  // ponytail: clamp — 0.7× (ultrawide) to 3× (portrait phone)
  return ARCH_ORBIT.R * Math.min(Math.max(scale, 0.7), 3.0);
}

/** Hero base camera position at a given R. */
export function basePosFromR(R: number): [number, number, number] {
  return [
    ARCH_ORBIT.center[0] + Math.cos(2.0) * R * 0.2,
    ARCH_ORBIT.H,
    ARCH_ORBIT.center[2] + Math.sin(2.0) * R,
  ];
}

/** Scroll zoom-in position at a given R. */
export function zoomPosFromR(R: number): [number, number, number] {
  return [
    ARCH_ORBIT.center[0] + Math.cos(2.0) * R * 0.2 * ZOOM_R_FACTOR,
    ARCH_ORBIT.H + ZOOM_H_DELTA,
    ARCH_ORBIT.center[2] + Math.sin(2.0) * R * ZOOM_R_FACTOR,
  ];
}

// ─────────────────────────────────────────────────────────────────────────────

/** Per-route camera positions for landmark zoom.
 *  ponytail: tune with ?cam&debug — initial values estimated from landmark world coords.
 *  Landmarks: Docks [15,1,13], Lighthouse [29.5,7,-3], Bottle [-11,0,13] */
export const ROUTE_CAMERAS: Record<string, { position: [number, number, number]; lookAt: [number, number, number] }> = {
  '/games':   { position: [12,  10, 36], lookAt: [15,   3, 13]  }, // Docks
  '/lab':     { position: [18,  13, 18], lookAt: [29.5, 7, -3]  }, // Lighthouse
  '/contact': { position: [-8,  10, 34], lookAt: [-11,  2, 13]  }, // Bottle
};

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
