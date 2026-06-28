import { create } from 'zustand';

/**
 * Scroll progress store -- written by SmoothScroll (Lenis), read by CameraRig + NarrativeCamera.
 */
interface ScrollState {
  /** 0 to 1 progress through the full page. */
  progress: number;
  setProgress: (p: number) => void;
  /**
   * 0 to 1 progress through the FIRST screenful only.
   * Used by NarrativeCamera to zoom in as the hero scrolls past.
   * Reaches 1 at scrollY === window.innerHeight, stays 1 beyond that.
   */
  heroProgress: number;
  setHeroProgress: (p: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  setProgress: (p) => set({ progress: p }),
  heroProgress: 0,
  setHeroProgress: (p) => set({ heroProgress: p }),
}));
