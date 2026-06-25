import { create } from 'zustand';

export type ThemeName = 'dusk' | 'dawn';

interface ThemeState {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggle: () => void;
}

/**
 * Global theme (zustand singleton -- readable inside the R3F canvas and the DOM
 * UI alike, no context bridging needed). `dusk` = purple night, `dawn` = golden.
 */
export const useTheme = create<ThemeState>((set, get) => ({
  theme: 'dusk',
  setTheme: (t) => set({ theme: t }),
  toggle: () => set({ theme: get().theme === 'dusk' ? 'dawn' : 'dusk' }),
}));
