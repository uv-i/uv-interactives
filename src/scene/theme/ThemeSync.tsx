'use client';

import { useEffect } from 'react';
import { useTheme, type ThemeName } from '@/shared/state/themeStore';

const KEY = 'uvi-theme';

function systemTheme(): 'dusk' | 'dawn' {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'dawn' : 'dusk';
}

function applyResolved(resolved: 'dusk' | 'dawn') {
  document.documentElement.dataset.theme = resolved;
  document.documentElement.classList.toggle('theme-dawn', resolved === 'dawn');
  // Only update store if value actually changed — prevents infinite loop
  if (useTheme.getState().resolved !== resolved) {
    useTheme.getState().setResolved(resolved);
  }
}

let tweenTimer: ReturnType<typeof setTimeout> | null = null;

export function ThemeSync() {
  useEffect(() => {
    // Restore saved preference
    let initial: ThemeName = 'dusk';
    try {
      const saved = localStorage.getItem(KEY) as ThemeName | null;
      if (saved === 'dusk' || saved === 'dawn' || saved === 'auto') initial = saved;
    } catch { /* ignore */ }

    useTheme.getState().setTheme(initial);

    let mq: MediaQueryList | null = null;
    let mqHandler: (() => void) | null = null;

    const applyTheme = (t: ThemeName) => {
      try { localStorage.setItem(KEY, t); } catch { /* ignore */ }

      // Tween: add transitioning class, remove after animation completes
      if (tweenTimer) clearTimeout(tweenTimer);
      document.documentElement.classList.add('theme-transitioning');
      tweenTimer = setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 450);

      // Detach old media-query listener
      if (mq && mqHandler) { mq.removeEventListener('change', mqHandler); mqHandler = null; }

      if (t === 'auto') {
        applyResolved(systemTheme());
        mq = window.matchMedia('(prefers-color-scheme: light)');
        mqHandler = () => applyResolved(systemTheme());
        mq.addEventListener('change', mqHandler);
      } else {
        applyResolved(t);
      }
    };

    applyTheme(initial);
    // Subscribe only to `theme` changes, not `resolved` — avoids feedback loop
    return useTheme.subscribe((s, prev) => {
      if (s.theme !== prev.theme) applyTheme(s.theme);
    });
  }, []);

  return null;
}
