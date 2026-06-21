import { create } from 'zustand';

/**
 * Staged-reveal sequence for the 3D harbour.
 * `stage` means "all stages with index <= stage are revealed".
 * Order: water -> trees -> lighthouse -> docks -> extras (boat).
 */
export const STAGE = {
  WATER: 0,
  TREES: 1,
  LIGHTHOUSE: 2,
  DOCKS: 3,
  EXTRAS: 4,
} as const;

export const MAX_STAGE = STAGE.EXTRAS;

interface RevealState {
  stage: number;
  setStage: (n: number) => void;
  revealAll: () => void;
  reset: () => void;
}

export const useReveal = create<RevealState>((set) => ({
  stage: -1,
  setStage: (n) => set({ stage: n }),
  revealAll: () => set({ stage: MAX_STAGE }),
  reset: () => set({ stage: -1 }),
}));
