import type { Metadata } from 'next';
import { getContentRepository } from '@/content';
import { ContactView } from '@/features/contact/ContactView';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = pageMetadata(
  'Contact',
  'Get in touch with UV Interactives — collaborations, learning, and game dev.',
  '/contact',
);

export default async function ContactPage() {
  const repo = getContentRepository();
  const config = await repo.getConfig();
  return <ContactView config={config} />;
}
