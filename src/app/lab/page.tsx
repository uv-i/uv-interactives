import type { Metadata } from 'next';
import { getContentRepository } from '@/content';
import { DevLabView, type TutorialLink } from '@/features/devlab/DevLabView';
import { pageMetadata } from '@/lib/seo/metadata';
import { getSeriesList } from '@/features/learn/learn';

export const metadata: Metadata = pageMetadata(
  'Dev Lab — Free Game Dev Learning',
  'Free, open-source Unity & C# learning packages with step-by-step tutorials — install from GitHub, build from scratch. Unreal, UEFN and Fortnite tracks coming soon.',
  '/lab',
);

/** Club each package with its tutorial series, matched by GitHub repo URL. */
function tutorialsByRepo(): Record<string, TutorialLink> {
  const out: Record<string, TutorialLink> = {};
  for (const s of getSeriesList()) {
    if (!s.packageRepo) continue;
    out[s.packageRepo] = {
      series: s.series,
      topic: s.topic,
      topicHref: `/lab/${s.topic}`,
      chapters: s.chapterRefs.map(({ part, slug }) => ({ part, slug })),
    };
  }
  return out;
}

export default async function DevLabPage() {
  const repo = getContentRepository();
  const [teaching, config] = await Promise.all([repo.getTeaching(), repo.getConfig()]);
  return <DevLabView teaching={teaching} config={config} tutorials={tutorialsByRepo()} />;
}
