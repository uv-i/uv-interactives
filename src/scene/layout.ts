import { useGLTF } from '@react-three/drei';

/**
 * Harbour layout — read directly from the Blender `UVI_Preview` scene
 * (source of truth) and converted to three.js via (x, z, -y); a Blender
 * Z-rotation becomes a three Y-rotation.
 */
export const MODELS = {
  terrain: '/models/terrain.glb',
  palmA: '/models/palm_a.glb',
  palmB: '/models/palm_b.glb',
  palmC: '/models/palm_c.glb',
  lighthouse: '/models/lighthouse.glb',
  boat: '/models/boat.glb',
  pier: '/models/pier.glb',
  railing: '/models/railing.glb',
  lamp: '/models/lamp.glb',
} as const;

type Vec3 = [number, number, number];

export interface Placement {
  url: string;
  position: Vec3;
  rotationY?: number;
  scale?: number;
}

export const TERRAIN: Placement = { url: MODELS.terrain, position: [0, -1.76, 0] };

export const LIGHTHOUSE: Placement = {
  url: MODELS.lighthouse,
  position: [16.763, 6.217, -12.468],
  rotationY: 2.6,
  scale: 1.35,
};

export const DOCK: { pier: Placement; railing: Placement; lamp: Placement } = {
  pier: { url: MODELS.pier, position: [-19.178, 0.732, -0.243], rotationY: -1.571 },
  railing: { url: MODELS.railing, position: [-19.178, 0.732, -0.243], rotationY: -1.571 },
  lamp: { url: MODELS.lamp, position: [-12.931, 1.28, -1.303], rotationY: 1.571 },
};

export const BOATS: Placement[] = [
  { url: MODELS.boat, position: [-14.518, 0.19, 2.812], rotationY: 1.184, scale: 1 },
  { url: MODELS.boat, position: [-1.594, 0.436, -16.276], rotationY: 1.9, scale: 2 },
  { url: MODELS.boat, position: [-9.404, 0.342, 4.015], rotationY: 3.083, scale: 1.5 },
];

const P = (a: 'A' | 'B' | 'C', position: Vec3, rotationY: number, scale: number): Placement => ({
  url: a === 'A' ? MODELS.palmA : a === 'B' ? MODELS.palmB : MODELS.palmC,
  position,
  rotationY,
  scale,
});

export const PALMS: Placement[] = [
  P('C', [15.886, 0.251, 1.832], -1.947, 0.902),
  P('C', [15.256, 0.4, 13.143], 2.924, 0.933),
  P('C', [13.821, 1.374, 26.261], 2.335, 0.911),
  P('B', [17.585, 0.851, 5.437], 0.082, 0.715),
  P('B', [31.073, 3.948, -3.801], 2.446, 0.879),
  P('A', [10.958, 0.327, -1.054], 0.796, 0.651),
  P('A', [14.622, 0.4, 17.822], -0.114, 0.912),
  P('B', [9.053, 1.03, -5.588], -0.781, 0.838),
  P('A', [-20.9, -0.402, 25.737], -0.213, 0.918),
  P('B', [6.677, 0.351, -11.193], -0.406, 0.729),
  P('B', [3.191, 0.4, 32.426], 0.021, 0.853),
  P('B', [8.551, 1.317, -16.309], 1.922, 0.859),
  P('A', [-28.13, 1.994, 30.633], 0.358, 0.943),
  P('A', [-19.854, 0.129, 6.058], 2.539, 0.815),
  P('B', [-18.765, -0.542, -7.24], 0.057, 0.664),
  P('A', [-18.247, 0.536, -13.506], 0.747, 0.724),
  P('B', [12.858, 2.964, -18.679], -2.988, 0.883),
];

// Hero camera, based on PreviewCam but raised/tilted down so the river sits in
// the wide-short hero frame (the original near-horizontal angle cropped the water).
export const CAMERA = {
  position: [-12.79, 12.83, 48.67] as Vec3,
  target: [-5.85, 11.27, 9.31] as Vec3,
  fov: 40,
};

export function preloadHarbour() {
  Object.values(MODELS).forEach((u) => useGLTF.preload(u));
}
