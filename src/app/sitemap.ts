import type { MetadataRoute } from 'next';
import { studioConfig } from '@/content/data/config';
import { TOPICS, getAllPosts, getPostsByTopic, type LearnTopic } from '@/features/learn/learn';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = studioConfig.siteUrl;
  const now = new Date();
  const routes = ['', '/lab', '/games', '/contact'];

  const staticEntries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : path === '/lab' ? 0.9 : 0.7,
  }));

  const topicEntries: MetadataRoute.Sitemap = (Object.keys(TOPICS) as LearnTopic[])
    .filter((t) => getPostsByTopic(t).length > 0)
    .map((t) => ({
      url: `${base}/lab/${t}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((m) => ({
    url: `${base}/lab/${m.topic}/${m.slug}`,
    lastModified: new Date(m.updated),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticEntries, ...topicEntries, ...postEntries];
}
