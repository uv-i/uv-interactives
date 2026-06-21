import type { Metadata } from 'next';
import { getContentRepository } from '@/content';
import { AboutView } from '@/features/about/AboutView';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata(
  'About',
  'UV Interactives — a small game studio sharing free learning materials and building original games.',
  '/about',
);

export default async function AboutPage() {
  const repo = getContentRepository();
  const config = await repo.getConfig();
  return <AboutView config={config} />;
}
