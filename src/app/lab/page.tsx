import type { Metadata } from 'next';
import { getContentRepository } from '@/content';
import { DevLabView } from '@/features/devlab/DevLabView';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata(
  'Dev Lab — Free Game Dev Learning',
  'Free, open-source Unity & C# learning packages you can install from GitHub. Unreal, UEFN and Fortnite tracks coming soon.',
  '/lab',
);

export default async function DevLabPage() {
  const repo = getContentRepository();
  const [teaching, config] = await Promise.all([repo.getTeaching(), repo.getConfig()]);
  return <DevLabView teaching={teaching} config={config} />;
}
