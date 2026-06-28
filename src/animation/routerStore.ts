import { create } from 'zustand';

/** Navigation bridge: R3F canvas can't call useRouter (React context doesn't cross).
 *  Set pendingRoute inside canvas; RouterBridge (providers.tsx) reads and calls router.push. */
interface RouterStore {
  pendingRoute: string | null;
  navigate: (r: string) => void;
  clear: () => void;
}

export const useRouterStore = create<RouterStore>((set) => ({
  pendingRoute: null,
  navigate: (r) => set({ pendingRoute: r }),
  clear: () => set({ pendingRoute: null }),
}));
