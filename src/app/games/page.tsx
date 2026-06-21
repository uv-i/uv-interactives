import type { Metadata } from 'next';
import { getContentRepository } from '@/content';
import { GamesView } from '@/features/games/GamesView';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata(
  'Games',
  'UV Interactives — original games in development, plus Guess In 10 (owned by Skillmatics, maintained by UV).',
  '/games',
);

export default async function GamesPage() {
  const repo = getContentRepository();
  const [games, config] = await Promise.all([repo.getGames(), repo.getConfig()]);
  return <GamesView games={games} config={config} />;
}
