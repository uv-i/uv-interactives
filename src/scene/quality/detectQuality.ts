/**
 * Device capability detection → quality tier (Strategy pattern input).
 * Pure, client-only. Conservative: unknown/low devices fall back gracefully.
 */
export type QualityTier = 'high' | 'medium' | 'low';

export interface QualityProfile {
  tier: QualityTier;
  reducedMotion: boolean;
  /** Whether to mount the WebGL canvas at all. */
  enable3D: boolean;
  /** Clamp for renderer pixel ratio. */
  maxPixelRatio: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    );
  } catch {
    return false;
  }
}

export function detectQuality(): QualityProfile {
  const reducedMotion = prefersReducedMotion();

  if (typeof window === 'undefined') {
    // SSR default — assume capable, refine on the client after mount.
    return { tier: 'high', reducedMotion: false, enable3D: true, maxPixelRatio: 2 };
  }

  const webgl = hasWebGL();
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

  if (!webgl || reducedMotion) {
    return { tier: 'low', reducedMotion, enable3D: false, maxPixelRatio: 1 };
  }

  // ponytail: mobile kills WebGL entirely — too much heat, no gameplay loss
  if (isMobile) {
    return { tier: 'low', reducedMotion, enable3D: false, maxPixelRatio: 1 };
  }

  const weak = cores <= 4 || deviceMemory <= 4;

  if (weak) {
    return { tier: 'medium', reducedMotion, enable3D: true, maxPixelRatio: 1.5 };
  }

  return { tier: 'high', reducedMotion, enable3D: true, maxPixelRatio: 2 };
}
