import { create } from 'zustand';

const KEY = 'uvi_island_3d';

interface IslandStore {
  isIsland: boolean;
  transitioning: boolean;
  enter: () => void;
  exit: () => void;
}

export const useIslandStore = create<IslandStore>((set, get) => ({
  // Always start true (SSR-safe). IslandSync reads localStorage after hydration.
  isIsland: true,
  transitioning: false,

  enter: () => {
    if (get().transitioning) return;
    set({ transitioning: true });
    setTimeout(() => {
      localStorage.setItem(KEY, '1');
      set({ isIsland: true });
      setTimeout(() => set({ transitioning: false }), 400);
    }, 280);
  },

  exit: () => {
    if (get().transitioning) return;
    set({ transitioning: true });
    setTimeout(() => {
      localStorage.setItem(KEY, '0');
      set({ isIsland: false });
      setTimeout(() => set({ transitioning: false }), 400);
    }, 280);
  },
}));
