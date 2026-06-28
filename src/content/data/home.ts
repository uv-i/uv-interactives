/**
 * Static home-page content.
 * No icons here — data stays CMS-portable (strings only).
 * UI layer resolves icon names via its own map.
 */

export interface Stat {
  value: string;
  label: string;
  icon: string; // lucide icon name
}

export interface ForgePost {
  slug: string;
  title: string;
  tag: string;
  mins: number;
}

export const stats: Stat[] = [
  { value: '50K+', label: 'Downloads on Partner Titles', icon: 'Download'  },
  { value: '1',    label: 'Active Client Partnership',   icon: 'Trophy'    },
  { value: '8+',   label: 'Years in Game Dev',           icon: 'Sparkles'  },
  { value: '4+',   label: 'Service Areas',               icon: 'Flame'     },
];

export const platforms: string[] = [
  'Unity', 'UEFN · Verse', 'WebGL', 'Firebase', 'iOS', 'Android', 'AR Foundation', 'Cocos Creator',
];

export const forgePosts: ForgePost[] = [
  { slug: 'unity-upm-packages-101',   title: 'How we ship Unity tutorials as UPM packages',        tag: 'Dev process', mins: 5 },
  { slug: 'fortnite-verse-scripting', title: 'Getting started with Verse scripting in UEFN',       tag: 'Tutorial',    mins: 8 },
  { slug: 'firebase-unity-mobile',    title: 'Firebase in Unity: analytics, auth & remote config', tag: 'Tutorial',    mins: 7 },
];
