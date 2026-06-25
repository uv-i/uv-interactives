'use client';

import { useEffect } from 'react';
import { useTheme, type ThemeName } from '@/scene/theme/themeStore';

const KEY = 'uvi-theme';

/** Restores the saved theme, persists changes, and mirrors it onto <html>. */
export function ThemeSync() {
  useEffect(() => {
    let initial: ThemeName = 'dusk';
    try {
      const saved = localStorage.getItem(KEY) as ThemeName | null;
      if (saved === 'dusk' || saved === 'dawn') initial = saved;
      else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) initial = 'dawn';
    } catch {
      /* ignore */
    }
    useTheme.getState().setTheme(initial);

    const apply = (t: ThemeName) => {
      document.documentElement.dataset.theme = t;
      document.documentElement.classList.toggle('theme-dawn', t === 'dawn');
      try {
        localStorage.setItem(KEY, t);
      } catch {
        /* ignore */
      }
    };
    apply(initial);
    return useTheme.subscribe((s) => apply(s.theme));
  }, []);

  return null;
}
