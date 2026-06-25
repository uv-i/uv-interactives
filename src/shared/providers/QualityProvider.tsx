'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { detectQuality, type QualityProfile } from '@/scene/quality/detectQuality';
import { useQualityStore } from '@/scene/quality/qualityStore';

const SSR_DEFAULT: QualityProfile = {
  tier: 'high',
  reducedMotion: false,
  enable3D: false,
  maxPixelRatio: 2,
};

const QualityContext = createContext<QualityProfile>(SSR_DEFAULT);

export function QualityProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<QualityProfile>(SSR_DEFAULT);

  useEffect(() => {
    const p = detectQuality();
    setProfile(p);
    useQualityStore.getState().apply(p);

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = () => {
        const next = detectQuality();
        setProfile(next);
        useQualityStore.getState().apply(next);
      };
      mq.addEventListener?.('change', onChange);
      return () => mq.removeEventListener?.('change', onChange);
    }
  }, []);

  return <QualityContext.Provider value={profile}>{children}</QualityContext.Provider>;
}

export function useQuality(): QualityProfile {
  return useContext(QualityContext);
}
