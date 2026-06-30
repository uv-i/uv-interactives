import { create } from 'zustand';

export type ThemeName = 'dusk' | 'dawn' | 'auto';

interface ThemeState {
  theme: ThemeName;
  /** Always 'dusk' | 'dawn' — what's actually applied (resolves 'auto'). */
  resolved: 'dusk' | 'dawn';
  setTheme: (t: ThemeName) => void;
  setResolved: (r: 'dusk' | 'dawn') => void;
  cycle: () => void;
}

/**
 * Global theme (zustand singleton). 'auto' = follow system prefers-color-scheme.
 * `resolved` is always dusk|dawn and safe to pass to 3D grade lookups.
 */
export const useTheme = create<ThemeState>((set, get) => ({
  theme: 'dusk',
  resolved: 'dusk',
  setTheme: (t) => set({ theme: t }),
  setResolved: (r) => set({ resolved: r }),
  cycle: () => {
    const order: ThemeName[] = ['dusk', 'dawn', 'auto'];
    const idx = order.indexOf(get().theme);
    set({ theme: order[(idx + 1) % order.length] });
  },
}));
