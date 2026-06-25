import { create } from 'zustand';

/**
 * Scroll progress store -- written by SmoothScroll (Lenis), read by CameraRig.
 * ponytail: tideHeight removed -- nothing reads it. Re-add with a curve fn if
 * an ocean/camera scroll-drive is wired up.
 */
interface ScrollState {
  /** 0 to 1 progress through the page. */
  progress: number;
  setProgress: (p: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  setProgress: (p) => set({ progress: p }),
}));
