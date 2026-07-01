'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { QualityProvider } from '@/shared/providers/QualityProvider';
import { SmoothScroll } from '@/animation/SmoothScroll';
import { CustomCursor } from '@/shared/cursor/CustomCursor';
import { Leo } from '@/features/leo/Leo';
import { ParticleField } from '@/shared/ui/ParticleField';
import { useRouterStore } from '@/animation/routerStore';
import { useReveal } from '@/scene/reveal/revealStore';
import { LandmarkOverlay } from '@/scene/LandmarkOverlay';
import { TransitionCurtain } from '@/scene/TransitionCurtain';
import { IslandHUD } from '@/scene/IslandHUD';
import { useIslandStore } from '@/scene/islandStore';
import { ThemeSync } from '@/scene/theme/ThemeSync';

import { LoadingScreen } from '@/shared/loader/LoadingScreen';

function RouterBridge() {
  const router = useRouter();
  const { pendingRoute, clear } = useRouterStore();
  useEffect(() => {
    if (pendingRoute) { router.push(pendingRoute); clear(); }
  }, [pendingRoute, router, clear]);
  return null;
}

/** Ensures 3D reveal never replays on inner pages. */
function RevealGuard() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== '/') useReveal.getState().revealAll();
  }, [pathname]);
  return null;
}

/** Syncs island mode to html[data-island]. */
function IslandSync() {
  const isIsland = useIslandStore((s) => s.isIsland);
  useEffect(() => {
    if (localStorage.getItem('uvi_island_3d') === '0') {
      useIslandStore.setState({ isIsland: false });
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset.island = isIsland ? '1' : '0';
  }, [isIsland]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QualityProvider>
      <ThemeSync />
      <RouterBridge />
      <RevealGuard />
      <IslandSync />
      <TransitionCurtain />
      <IslandHUD />
      <LoadingScreen />
      <CustomCursor />
      <SmoothScroll>
        {children}
      </SmoothScroll>
      <LandmarkOverlay />
      <Leo />
      <ParticleField />
    </QualityProvider>
  );
}
