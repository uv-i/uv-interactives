import { create } from 'zustand';
import { MAX_STAGE } from '@/scene/archipelago/layout';

/**
 * Generic staged-reveal store. `stage` = "all stages with index <= stage are revealed".
 * MAX_STAGE is sourced from the active environment's layout -- update it there when
 * swapping worlds.
 */
interface RevealState {
  stage: number;
  setStage: (n: number) => void;
  revealAll: () => void;
  reset: () => void;
}

export const useReveal = create<RevealState>((set) => ({
  stage: -1,
  setStage: (n) => set((s) => ({ stage: Math.max(s.stage, n) })),
  revealAll: () => set({ stage: MAX_STAGE }),
  reset: () 