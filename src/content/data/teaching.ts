import type { TeachingPackage } from '@/content/models';

export const teaching: TeachingPackage[] = [
  {
    id: 'unity-fundamentals',
    title: 'Unity Fundamentals',
    summary:
      'The complete Unity 6 starter track — 10 modules, 30 scenes, 43 annotated scripts. Editor, physics, C#, UI, 2D, 3D with NavMesh AI, animation, audio, and the new Input System. The place to start.',
    engine: 'Unity',
    category: 'Unity Basics',
    level: 'Beginner',
    tags: ['Unity', 'C#', 'URP', 'Complete Course', 'Beginner'],
    githubUrl: 'https://github.com/uv-interactives/uvi-learn-unity-fundamentals',
    status: 'active',
  },
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
  {
    id: 'uefn-intro',
    title: 'UEFN Fundamentals',
    summary:
      'Getting started with Unreal Editor for Fortnite — island creation, Verse scripting basics, and your first custom game mode. Coming soon to GitHub.',
    engine: 'UEFN',
    category: 'Fortnite / UEFN',
    level: 'Beginner',
    tags: ['UEFN', 'Verse', 'Fortnite', 'Beginner'],
    githubUrl: '',
    status: 'coming-soon',
  },
  {
    id: 'verse-scripting',
    title: 'Verse Scripting Patterns',
    summary:
      'Practical Verse patterns for Fortnite island scripting — economy systems, NPC behaviour, tycoon loops, and event-driven game logic.',
    engine: 'Verse/Fortnite',
    category: 'Fortnite / UEFN',
    level: 'Intermediate',
    tags: ['Verse', 'UEFN', 'Fortnite', 'Intermediate'],
    githubUrl: '',
    status: 'coming-soon',
  },
];
