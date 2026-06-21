import type { MetadataRoute } from 'next';
import { studioConfig } from '@/content/data/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = studioConfig.siteUrl;
  const now = new Date();
  const routes = ['', '/lab', '/games', '/about', '/contact'];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : path === '/lab' ? 0.9 : 0.7,
  }));
}
