// Re-export from shared -- theme state is app-wide, not scene-specific.
// shared/layout and features import from @/shared/state/themeStore directly.
// scene files may keep importing from here; both resolve to the same store instance.
export { useTheme, type ThemeName } from '@/shared/state/themeStore';
