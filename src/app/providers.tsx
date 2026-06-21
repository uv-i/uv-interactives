'use client';

import type { ReactNode } from 'react';
import { QualityProvider } from '@/shared/providers/QualityProvider';
import { SmoothScroll } from '@/animation/SmoothScroll';
import { LoadingScreen } from '@/shared/loader/LoadingScreen';
import { CustomCursor } from '@/shared/cursor/CustomCursor';

/** Single client boundary for app-wide providers (keeps layout a server component). */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QualityProvider>
      <LoadingScreen />
      <CustomCursor />
      <SmoothScroll>{children}</SmoothScroll>
    </QualityProvider>
  );
}
