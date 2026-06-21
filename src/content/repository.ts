import type {
  ContentBundle,
  Game,
  TeachingPackage,
  StudioConfig,
  Service,
  ChatbotPersona,
} from '@/content/models';

/**
 * The abstraction every feature depends on (Dependency Inversion).
 * Swap LocalAdapter -> SanityAdapter later with zero UI changes.
 */
export interface ContentRepository {
  getConfig(): Promise<StudioConfig>;
  getGames(): Promise<Game[]>;
  getTeaching(): Promise<TeachingPackage[]>;
  getServices(): Promise<Service[]>;
  getChatbot(): Promise<ChatbotPersona>;
  getBundle(): Promise<ContentBundle>;
}
