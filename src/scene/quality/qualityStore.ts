import { create } from 'zustand';
import type { QualityProfile } from '@/scene/quality/detectQuality';

/**
 * Quality mirror as a zustand singleton so scene components INSIDE the R3F
 * canvas read the real device tier (React context does not cross the canvas).
 */
interface QualityStore extends QualityProfile {
  apply: (p: QualityProfile) => void;
}

export const useQualityStore = create<QualityStore>((set) => ({
  tier: 'high',
  reducedMotion: false,
  enable3D: false,
  maxPixelRatio: 2,
  apply: (p) => set(p),
}));
