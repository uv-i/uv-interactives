import { create } from 'zustand';

export interface PerfState {
  fps: number;
  calls: number;
  tris: number;
  geometries: number;
  textures: number;
  programs: number;
  set: (p: Partial<PerfState>) => void;
}

export const usePerfStore = create<PerfState>((set) => ({
  fps: 0,
  calls: 0,
  tris: 0,
  geometries: 0,
  textures: 0,
  programs: 0,
  set: (p) => set(p),
}));

/** Debug HUD on when ?debug is present or running in dev. */
export function isDebug(): boolean {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).has('debug')) return true;
  return process.env.NODE_ENV === 'development';
}
