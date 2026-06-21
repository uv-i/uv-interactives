import type { MetadataRoute } from 'next';
import { studioConfig } from '@/content/data/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${studioConfig.siteUrl}/sitemap.xml`,
  };
}
