import type { Service } from '@/content/models';

/** Icon strings map to lucide-react icons in the UI layer (kept serialisable). */
export const services: Service[] = [
  {
    id: 'unity',
    title: 'Unity Development',
    description:
      'Mobile games for Android & iOS — Firebase backend, store integration, live ops, and optimised builds.',
    icon: 'Gamepad2',
  },
  {
    id: 'uefn',
    title: 'UEFN / Fortnite',
    description:
      'Custom Fortnite islands built in Verse — tycoons, battle maps, economy systems, and live events.',
    icon: 'Zap',
  },
  {
    id: 'webgl',
    title: 'WebGL / Playable Ads',
    description:
      'Instant-play browser games and playable ad formats in Cocos Creator + TypeScript — no install required.',
    icon: 'Globe',
  },
  {
    id: 'ar',
    title: 'AR & Firebase',
    description:
      'Augmented reality experiences and cloud-connected game backends using AR Foundation and Firebase.',
    icon: 'Sparkles',
  },
];
