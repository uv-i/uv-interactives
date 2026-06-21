# uv-i

The new UV Interactives website — Next.js (App Router) + TypeScript, with a 3D
"rising-tide harbour" experience layered on top of fast, SEO-clean content.

See **BLUEPRINT.md** for the full plan and roadmap.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build     # production build
npm run start     # serve the production build
npm run lint      # eslint
npm run typecheck # tsc --noEmit
```

> Run `npm install` on your machine (Windows). Native dependencies (Next SWC,
> three) are platform-specific, so don't copy a `node_modules` built elsewhere.

## Architecture (Phase 0 foundation)

Feature-based, loosely coupled, SOLID-oriented:

```
src/
  app/          Next routes (thin: fetch + compose), layout, sitemap, robots
  features/     one folder per page-feature (home, devlab, games, about, contact)
  scene/        3D harbour — quality detection now; R3F canvas in Phase 2
  shared/       cross-cutting UI kit, layout, providers, SEO components
  content/      typed models + ContentRepository + LocalAdapter (CMS-swappable)
  animation/    Lenis smooth scroll, GSAP/ScrollTrigger, scroll/tide store
  lib/seo/      metadata + JSON-LD builders
  styles/       Tailwind + design tokens (violet + gold, from the brand)
```

Key ideas:

- **Content is data.** Add a teaching package or game by editing
  `src/content/data/*` — no component changes. Every record carries an `engine`
  field so Unreal / UEFN / Fortnite tracks drop in when ready.
- **Repository pattern.** Features depend on the `ContentRepository` interface,
  not on local files. Swap in a Sanity adapter later via `src/content/index.ts`
  with zero UI changes.
- **Quality tiers.** `scene/quality/detectQuality.ts` picks high / medium / low
  and whether to mount WebGL at all (off for reduced-motion / weak devices).
- **Scroll → tide.** `animation/scrollStore.ts` holds one `tideHeight` value the
  3D scene will read so scrolling raises the whole harbour.
- **SEO-first.** Server-rendered content, per-route metadata, JSON-LD
  (Organization, Person, Course per package, VideoGame), sitemap + robots.

## What's next (Phase 1+)

Shared UI polish → 3D scene foundation (ocean shader, lazy Blender assets) →
Home rising-tide narrative → Dev Lab → Games → About → Contact + Leo → polish.
