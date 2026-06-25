import type { ThemeName } from '@/scene/theme/themeStore';

/**
 * Art-directed colour grade per theme. The scene lerps toward these so the
 * toggle crossfades smoothly.
 *   dawn = golden sunrise (Mahabalipuram reference)
 *   dusk = purple night with moon + stars (clearly night, moonlit but readable)
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
  key: { color: string; intensity: number };
  rim: { color: string; intensity: number };
  ocean: { deep: string; shallow: string; sun: string };
  stars: number;
  exposure: number;
}

export const THEME_GRADE: Record<ThemeName, Grade> = {
  dawn: {
    skyTop: '#7fb6dd',
    skyBottom: '#ffd9a6',
    bodyDir: [42, 22, 24],
    bodyColor: '#fff3cf',
    bodyGlow: '#ffcf8a',
    bodySize: 7,
    fog: { color: '#e6e2cf', near: 90, far: 270 },
    ambient: { color: '#cfe0ff', intensity: 0.55 },
    hemi: { sky: '#dcecff', ground: '#6a6048', intensity: 0.6 },
    key: { color: '#ffe2ad', intensity: 2.2 },
    rim: { color: '#9ec5ff', intensity: 0.4 },
    ocean: { deep: '#0c3d54', shallow: '#2f86a6', sun: '#ffe7b3' },
    stars: 0,
    exposure: 1.05,
  },
  dusk: {
    skyTop: '#121a44',
    skyBottom: '#41306e',
    bodyDir: [-26, 18, -32],
    bodyColor: '#eef2ff',
    bodyGlow: '#aab8ec',
    bodySize: 6,
    fog: { color: '#222a52', near: 85, far: 250 },
    ambient: { color: '#8090cc', intensity: 0.6 },
    hemi: { sky: '#5e6fc0', ground: '#2c2e52', intensity: 0.55 },
    key: { color: '#c2cdff', intensity: 1.5 },
    rim: { color: '#8e9ade', intensity: 0.5 },
    ocean: { deep: '#12274e', shallow: '#356096', sun: '#d6e4ff' },
    stars: 1,
    exposure: 0.95,
  },
};
