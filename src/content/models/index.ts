/**
 * Content models — the typed contracts every feature depends on.
 *
 * Design intent (SOLID):
 *  - These narrow interfaces are the only thing UI components import (ISP/DIP).
 *  - Adding a new engine or package is pure data — no interface change (OCP).
 */

/** Engines the studio teaches / ships in. Extend as new tracks launch. */
export type Engine = 'Unity' | 'Unreal' | 'UEFN' | 'Verse/Fortnite' | 'WebGL';

export type GameStatus = 'live' | 'in-development' | 'coming-soon';

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface StudioConfig {
  studio: string;
  founderName: string;
  founderShort: string;
  tagline: string;
  motto: string;
  contactEmail: string;
  contactLocation: string;
  nativePlace: string;
  socials: SocialLinks;
  /** Marketing URL used for canonical/OG tags. */
  siteUrl: string;
}

export interface StoreLinks {
  android?: string;
  ios?: string;
  web?: string;
  /** External IP-owner / partner page. */
  partnerUrl?: string;
}

export interface Game {
  id: string;
  title: string;
  genre: string;
  engine: Engine;
  status: GameStatus;
  year?: string;
  summary: string;
  highlights?: string[];
  tags?: string[];
  links?: StoreLinks;
  /** Attribution shown verbatim when the IP belongs to a client/partner. */
  attribution?: string;
  /** UV-owned original vs partner/maintained title. */
  ownership: 'original' | 'partner';
}

export interface TeachingPackage {
  id: string;
  title: string;
  summary: string;
  engine: Engine;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  githubUrl: string;
  status: 'active' | 'coming-soon';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  /** Lucide icon name (resolved in the UI layer, kept as a string here so
   *  the data stays serialisable and CMS-portable). */
  icon: string;
}

export interface ChatbotFact {
  text: string;
  route: string | null;
  routeLabel: string | null;
}

export interface ChatbotPersona {
  name: string;
  intros: string[];
  facts: ChatbotFact[];
  systemPrompt: string;
}

/** Everything a page might need, fetched through the repository. */
export interface ContentBundle {
  config: StudioConfig;
  games: Game[];
  teaching: TeachingPackage[];
  services: Service[];
  chatbot: ChatbotPersona;
}
