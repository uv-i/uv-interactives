import type { Metadata } from 'next';
import { studioConfig } from '@/content/data/config';

const { studio, tagline, siteUrl } = studioConfig;

/** Site-wide metadata defaults (App Router merges per-route overrides). */
export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${studio} — Game Studio & Free Learning`,
    template: `%s · ${studio}`,
  },
  description:
    'UV Interactives builds games and shares free Unity & C# learning packages. Unreal, UEFN and Fortnite tracks coming soon. A rising tide lifts all boats.',
  applicationName: studio,
  keywords: [
    'game development',
    'Unity tutorials',
    'C# game dev',
    'Unreal Engine',
    'UEFN',
    'Fortnite Verse',
    'free game dev learning',
    'UV Interactives',
  ],
  authors: [{ name: studioConfig.founderName }],
  openGraph: {
    type: 'website',
    siteName: studio,
    title: `${studio} — Game Studio & Free Learning`,
    description: tagline,
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${studio} — Game Studio & Free Learning`,
    description: tagline,
  },
  robots: { index: true, follow: true },
};

/** Convenience for per-page metadata. */
export function pageMetadata(title: string, description: string, path = '/'): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: `${siteUrl}${path}` },
    twitter: { title, description },
  };
}
