import { create } from 'zustand';

/**
 * The bridge between scroll and the 3D harbour.
 * GSAP/Lenis write here; the R3F scene reads `tideHeight`.
 * One number drives the whole "rising tide" interaction.
 */
interface ScrollState {
  /** 0 → 1 progress through the page. */
  progress: number;
  /** Derived water level the ocean, boats and camera read. */
  tideHeight: number;
  setProgress: (p: number) => void;
}

/** Map raw scroll progress to a tide level (tweak curve per design). */
const toTide = (p: number) => p; // linear for now; eased in the scene layer

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  tideHeight: 0,
  setProgress: (p) => set({ progress: p, tideHeight: toTide(p) }),
}));
