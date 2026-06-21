'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  detectQuality,
  type QualityProfile,
} from '@/scene/quality/detectQuality';

/**
 * Provides the resolved quality profile to the whole app.
 * SSR renders a safe default; the client refines it after mount.
 */
const SSR_DEFAULT: QualityProfile = {
  tier: 'high',
  reducedMotion: false,
  enable3D: false, // off until the client confirms capability — avoids hydration flashes
  maxPixelRatio: 2,
};

const QualityContext = createContext<QualityProfile>(SSR_DEFAULT);

export function QualityProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<QualityProfile>(SSR_DEFAULT);

  useEffect(() => {
    setProfile(detectQuality());

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = () => setProfile(detectQuality());
      mq.addEventListener?.('change', onChange);
      return () => mq.removeEventListener?.('change', onChange);
    }
  }, []);

  return <QualityContext.Provider value={profile}>{children}</QualityContext.Provider>;
}

export function useQuality(): QualityProfile {
  return useContext(QualityContext);
}
