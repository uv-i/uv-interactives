import type { Game } from '@/content/models';

/**
 * Only shipped/partner titles UV is authorised to show, plus originals
 * flagged as in-development. No client work beyond Guess In 10.
 */
export const games: Game[] = [
  {
    id: 'guess-in-10',
    title: 'Guess In 10',
    genre: 'Mobile · Educational Trivia',
    engine: 'Unity',
    status: 'live',
    year: '2023 → Now',
    summary:
      '10+ themes. 500+ question cards. Countless family game nights. Guess In 10 is Skillmatics\' flagship trivia experience — and UV Interactives keeps it live and loved, quietly handling everything behind the scenes so players always get the best version of the game.',
    highlights: ['50K+ downloads across Android & iOS', 'Live content updates & store ops'],
    tags: ['Unity', 'C#', 'Firebase', 'Android', 'iOS'],
    ownership: 'partner',
    role: 'Live ops & maintenance',
    partnerName: 'Skillmatics',
    attribution: 'IP © Skillmatics',
    links: {
      android: 'https://play.google.com/store/apps/details?id=com.skillmatics.guessin10',
      ios: 'https://apps.apple.com/in/app/guess-in-10-by-skillmatics/id1532193910',
      partnerUrl: 'https://www.skillmatics.in/collections/guess-in-10',
    },
  },
  {
    id: 'uv-original-01',
    title: 'UV Original — in development',
    genre: 'To be revealed',
    engine: 'Unreal',
    status: 'in-development',
    summary:
      "The studio's own games are under construction — expected to grow out of our Unreal / UEFN / Fortnite work. Setting sail soon.",
    ownership: 'original',
  },
];
