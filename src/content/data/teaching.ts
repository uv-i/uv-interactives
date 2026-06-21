import type { TeachingPackage } from '@/content/models';

/**
 * The free Dev Lab library. Today: Unity & C#.
 * Add Unreal / UEFN / Verse-Fortnite records here as they release —
 * the UI is engine-agnostic and categories are derived from this data.
 */
export const teaching: TeachingPackage[] = [
  {
    id: 'coin-rush',
    title: 'Coin Rush',
    summary:
      'A playable coin-collecting game that teaches Unity fundamentals — scene setup, Rigidbody physics, trigger collisions, UI systems, and essential C# scripting. Install via UPM from GitHub.',
    engine: 'Unity',
    category: 'Unity Basics',
    level: 'Beginner',
    tags: ['Unity', 'C#', 'URP', 'Physics', 'Beginner'],
    githubUrl: 'https://github.com/uv-interactives/uvi-learn-coin-rush',
    status: 'active',
  },
  {
    id: 'oop-pillars',
    title: 'OOP Pillars',
    summary:
      'Hands-on Unity package teaching the four pillars of OOP — Encapsulation, Inheritance, Polymorphism, and Abstraction — through interactive game mechanics and practical C# examples.',
    engine: 'Unity',
    category: 'C# Concepts',
    level: 'Intermediate',
    tags: ['Unity', 'C#', 'OOP', 'Patterns', 'Intermediate'],
    githubUrl: 'https://github.com/uv-interactives/uvi-learn-oop-pillars',
    status: 'active',
  },
];
