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
    id: 'unreal',
    title: 'Unreal / UEFN',
    description:
      'Unreal Engine and UEFN experiences with Verse scripting — interactive worlds and Fortnite islands.',
    icon: 'Boxes',
  },
  {
    id: 'webgl',
    title: 'WebGL & Playables',
    description:
      'Instant-play browser games and playable ads — lightweight, shareable, no install required.',
    icon: 'Globe',
  },
  {
    id: 'teaching',
    title: 'Free Learning',
    description:
      'Open-source Unity & C# teaching packages — install straight from GitHub. Unreal & UEFN tracks coming soon.',
    icon: 'GraduationCap',
  },
];
