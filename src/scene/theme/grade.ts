import type { ThemeName } from '@/scene/theme/themeStore';

/**
 * Art-directed colour grade per theme.
 *   dawn = golden sunrise
 *   dusk = moonlit night
 *
 * bodyDir  — sky-body (sun/moon disc) position in SkyDome. Keep shallow for realism.
 * keyDir   — actual key light position. Decoupled so we can use a steep angle
 *            that properly illuminates rooftops, castle walls, etc.
 * fillDir  — fill light position (front-opposite side from key).
 * rimDir   — rim/back light position.
 */
export interface Grade {
  skyTop: string;
  skyBottom: string;
  bodyDir: [number, number, number];
  bodyColor: string;
  bodyGlow: string;
  bodySize: number;
  fog: { color: string; near: number; far: number };
  ambient: { color: string; intensity: number };
  hemi: { sky: string; ground: string; intensity: number };
  key:  { color: string; intensity: number; dir: [number, number, number] };
  fill: { color: string; intensity: number; dir: [number, number, number] };
  rim:  { color: string; intensity: number; dir: [number, number, number] };
  ocean: { deep: string; shallow: string; sun: string };
  stars: number;
  exposure: number;
}

export const THEME_GRADE: Record<ThemeName, Grade> = {
  dawn: {
    skyTop: '#7fb6dd',
    skyBottom: '#ffd9a6',
    bodyDir: [40, 10, -90],      // sun disc stays near horizon
    bodyColor: '#fff3cf',
    bodyGlow: '#ffcf8a',
    bodySize: 10,
    fog: { color: '#ffd9a6', near: 85, far: 255 },
    ambient: { color: '#ffe8cc', intensity: 0.1 },
    hemi:    { sky: '#d0e8ff', ground: '#9a7a40', intensity: 0.1 },
    // Key: warm sun, steep angle from upper-right-front — hits roofs & walls
    key:  { color: '#fff4c2', intensity: 1.0, dir: [30, 55, 25] },
    // Fill: softer golden fill from upper-left-front
    fill: { color: '#ffd090', intensity: 0.6, dir: [-30, 35, 40] },
    // Rim: cool sky blue from behind, defines silhouettes
    rim:  { color: '#9ec5ff', intensity: 0.2, dir: [-15, 30, -60] },
    ocean: { deep: '#0c3d54', shallow: '#2f86a6', sun: '#ffe7b3' },
    stars: 0,
    exposure: 1.0,
  },
  dusk: {
    skyTop: '#121a44',
    skyBottom: '#41306e',
    bodyDir: [40, 12, -100],     // moon disc stays near horizon
    bodyColor: '#eef2ff',
    bodyGlow: '#aab8ec',
    bodySize: 7,
    fog: { color: '#41306e', near: 85, far: 250 },
    ambient: { color: '#8090cc', intensity: 0.2 },
    hemi:    { sky: '#6070c8', ground: '#2c2e52', intensity: 1.2 },
    // Key: cold moonlight from upper-left, steep enough to light castle walls
    key:  { color: '#c8d8ff', intensity: 1.0, dir: [30, 55, 25] },
    // Fill: softer blue-violet fill from front-right
    fill: { color: '#5068b8', intensity: 10.0, dir: [35, 25, 45] },
    // Rim: purple backlight
    rim:  { color: '#9e80ee', intensity: 10.0, dir: [10, 20, -55] },
    ocean: { deep: '#12274e', shallow: '#356096', sun: '#d6e4ff' },
    stars: 1,
    exposure: .2,
  },
};
