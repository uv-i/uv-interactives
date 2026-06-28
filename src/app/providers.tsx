'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { QualityProvider } from '@/shared/providers/QualityProvider';
import { SmoothScroll } from '@/animation/SmoothScroll';
import { CustomCursor } from '@/shared/cursor/CustomCursor';
import { Leo } from '@/features/leo/Leo';
import { ParticleField } from '@/shared/ui/ParticleField';
import { useRouterStore } from '@/animation/routerStore';
import { LandmarkOverlay } from '@/scene/LandmarkOverlay';
import { TransitionCurtain } from '@/scene/TransitionCurtain';
import { IslandHUD } from '@/scene/IslandHUD';
import { useIslandStore } from '@/scene/islandStore';

// ssr:false — framer-motion useReducedMotion returns different values on server vs client
const LoadingScreen = dynamic(
  () => import('@/shared/loader/LoadingScreen').then((m) => m.LoadingScreen),
  { ssr: false },
);

function RouterBridge() {
  const router = useRouter();
  const { pendingRoute, clear } = useRouterStore();
  useEffect(() => {
    if (pendingRoute) { router.push(pendingRoute); clear(); }
  }, [pendingRoute, router, clear]);
  return null;
}

/** Syncs island mode to html[data-island].
 *  Store always starts true (SSR-safe); localStorage opt-out applied post-hydration. */
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

function SceneBlur() {
  const pathname = usePathname();
  const isIsland = useIslandStore((s) => s.isIsland);
  const isHome = pathname === '/';
  const showBlur = !isHome && !isIsland;
  return (
    <div
      aria-hidden
      data-scene-blur=""
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backdropFilter: showBlur ? 'blur(18px) saturate(1.4)' : 'none',
        WebkitBackdropFilter: showBlur ? 'blur(18px) saturate(1.4)' : 'none',
        background: showBlur ? 'rgba(22,11,50,0.55)' : 'transparent',
      }}
    />
  );
}

function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{ minHeight: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QualityProvider>
      <RouterBridge />
      <IslandSync />
      <SceneBlur />
      <TransitionCurtain />
      <IslandHUD />
      <LoadingScreen />
      <CustomCursor />
      <SmoothScroll>
        <PageTransition>{children}</PageTransition>
      </SmoothScroll>
      <LandmarkOverlay />
      <Leo />
      <ParticleField />
    </QualityProvider>
  );
}
