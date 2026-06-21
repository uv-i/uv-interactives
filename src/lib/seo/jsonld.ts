import type { Game, TeachingPackage, StudioConfig } from '@/content/models';

/**
 * JSON-LD structured-data builders. Render the output inside a
 * <script type="application/ld+json"> tag (see <JsonLd /> component).
 */

export function organizationLd(config: StudioConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.studio,
    url: config.siteUrl,
    email: config.contactEmail,
    founder: { '@type': 'Person', name: config.founderName },
    sameAs: Object.values(config.socials).filter(Boolean),
    slogan: config.motto,
  };
}

export function personLd(config: StudioConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: config.founderName,
    alternateName: config.founderShort,
    jobTitle: 'Game Developer',
    worksFor: { '@type': 'Organization', name: config.studio },
    homeLocation: config.contactLocation,
    sameAs: Object.values(config.socials).filter(Boolean),
  };
}

/** A free teaching package modelled as a Course / LearningResource. */
export function courseLd(pkg: TeachingPackage, config: StudioConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: pkg.title,
    description: pkg.summary,
    url: pkg.githubUrl,
    inLanguage: 'en',
    teaches: pkg.tags.join(', '),
    educationalLevel: pkg.level,
    isAccessibleForFree: true,
    learningResourceType: 'Game-based learning package',
    provider: { '@type': 'Organization', name: config.studio, url: config.siteUrl },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function videoGameLd(game: Game, config: StudioConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    genre: game.genre,
    gamePlatform: game.engine,
    description: game.summary,
    publisher: { '@type': 'Organization', name: config.studio },
    ...(game.attribution ? { creditText: game.attribution } : {}),
  };
}
