import { getContentRepository } from '@/content';
import { HomeView } from '@/features/home/HomeView';
import type { ForgeTutorial } from '@/features/home/ForgeTeaser';
import { TOPICS, getSeriesList } from '@/features/learn/learn';

export default async function HomePage() {
  const repo = getContentRepository();
  const [config, services, games] = await Promise.all([
    repo.getConfig(),
    repo.getServices(),
    repo.getGames(),
  ]);

  // Tutorial shortcuts for the Forge section (server-side fs, client gets plain data)
  const tutorials: ForgeTutorial[] = getSeriesList().slice(0, 3).map((s) => ({
    series: s.series,
    topic: s.topic,
    title: s.title,
    topicLabel: TOPICS[s.topic].label,
    chapters: s.chapterRefs.map(({ part, slug }) => ({ part, slug })),
  }));

  return <HomeView config={config} services={services} games={games} tutorials={tutorials} />;
}
