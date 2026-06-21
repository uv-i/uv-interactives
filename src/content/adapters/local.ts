import type { ContentRepository } from '@/content/repository';
import type { ContentBundle } from '@/content/models';
import { studioConfig } from '@/content/data/config';
import { games } from '@/content/data/games';
import { teaching } from '@/content/data/teaching';
import { services } from '@/content/data/services';
import { chatbot } from '@/content/data/chatbot';

/**
 * LocalAdapter — serves the in-repo typed data.
 * Acts as the source of truth now and the fallback once a CMS is added.
 */
export class LocalContentAdapter implements ContentRepository {
  async getConfig() {
    return studioConfig;
  }
  async getGames() {
    return games;
  }
  async getTeaching() {
    return teaching;
  }
  async getServices() {
    return services;
  }
  async getChatbot() {
    return chatbot;
  }
  async getBundle(): Promise<ContentBundle> {
    return {
      config: studioConfig,
      games,
      teaching,
      services,
      chatbot,
    };
  }
}
