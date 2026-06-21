import type { ContentRepository } from '@/content/repository';
import { LocalContentAdapter } from '@/content/adapters/local';

/**
 * Factory (single composition point). To introduce a CMS later, return a
 * SanityContentAdapter here (optionally wrapped to fall back to local on error).
 * Nothing else in the app needs to change.
 */
let repo: ContentRepository | null = null;

export function getContentRepository(): ContentRepository {
  if (!repo) {
    repo = new LocalContentAdapter();
  }
  return repo;
}

export type { ContentRepository } from '@/content/repository';
export * from '@/content/models';
