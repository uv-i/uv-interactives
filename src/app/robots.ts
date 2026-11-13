import type { MetadataRoute } from 'next';
import { studioConfig } from '@/content/data/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },   // /i/ invitations stay crawlable: link-preview bots obey robots.txt; X-Robots-Tag noindex keeps them out of search
    sitemap: `${studioConfig.siteUrl}/sitemap.xml`,
  };
}
