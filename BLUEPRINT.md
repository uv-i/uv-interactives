# uv-i — Site Blueprint

**Studio:** UV Interactives · **Founder:** Bhuvaneshwaran M (Bhuvanesh)
**Motto:** *A rising tide lifts all boats.*
**Brand mark:** The crowned lion in a U·V shield (amber on violet).
**Theme:** A warm Madurai-flavoured seaport, reimagined as a living 3D harbour — the backdrop for the studio's two real offerings today: **free learning materials** and **games on the way.**

This document is the plan only. Nothing is built yet. We review this, agree on it, then build module by module in the roadmap order at the end.

---

## 1. The Concept

uv-i is a game studio with two honest things to show right now: **free, high-quality Unity & C# teaching packages**, and **original games in development.** The site's emotional argument is the motto: *a rising tide lifts all boats* — you lift other developers, and the tide carries everyone up.

We make that motto **literal and procedural**: the site is a coastal harbour at dawn. As the visitor scrolls, **the tide rises and the boats lift with it.** Boats are learners. The lighthouse is the free knowledge you share, sweeping its beam out to guide them. The **crowned lion** is the brand that presides over the harbour, and **Leo** — the lion cub — is the friendly guide who shows visitors around.

The setting is Madurai-flavoured (the founder's native city) but lightly so — it's *ambiance, not a history lesson.* Modern, clean, fast, playful; never kitsch.

### Visual motifs
- **The crowned lion (UVI logo)** — the dominant brand mark: nav, loader reveal, hero. Regal, warm.
- **Leo, the lion cub** — the AI harbour guide / mascot (the studio's existing character; named for the founder's son).
- **Twin-fish emblem** — used **subtly only**: a faint watermark, a quiet detail in the foam or a section divider. Never dominant.
- **Lighthouse** — the free-learning beacon; warm gold beam.
- **Palmyra palms (Panai maram)** — instanced along the shore, procedurally swaying (a soft Madurai/Tamil-coast nod).
- **Catamaran boats** — the "learner" vessels that rise with the tide (*catamaran* is itself a Tamil word, *kattu maram*).
- **The waterbody** — a Gerstner-wave ocean as the hero surface.

### Palette (from the brand)
- **Violet / indigo** ocean & sky (brand purple), **amber / gold** lighthouse beam and accents (brand orange), sandstone shore, pearl-white highlights, warm dawn light. Dark-first.

---

## 2. Site Map

Five routes, each named for a part of the harbour. Every page is server-rendered for content/SEO; the 3D is a progressive-enhancement layer on top.

### Home — *The Harbour* (`/`)
The flagship experience. A 3D coastal harbour at dawn: violet ocean, swaying palms, the lighthouse with a sweeping gold beam, moored catamarans, the crowned-lion logo resolving in as the brand. The tagline animates in.

As the visitor scrolls, the **tide rises**, boats lift, and the camera glides through the harbour, each scroll beat revealing a section: the motto → what UV does → the free-learning highlight (the mission) → games-in-development teaser → open-source banner → a "set sail with us" CTA. Procedural water, wind, beam, and boat-bob run continuously; scroll *scrubs* the tide height and camera path.

### Dev Lab — *The Lighthouse* (`/lab`)
**The heart of the site** — your free teaching packages, and the SEO priority. The lighthouse is the metaphor: knowledge shared freely to guide newcomers. Each package is a lantern/beacon; hovering lifts it and reveals the lesson, but every card is **real server-rendered HTML** (title, description, tags, GitHub link) so Google indexes all of it. Carries `Course` / `LearningResource` structured data for rich results.

Content (the two real repos):
- **Coin Rush** — Unity basics: scene setup, Rigidbody physics, trigger collisions, UI, core C#. Installable via UPM. → `github.com/uv-interactives/uvi-learn-coin-rush`
- **OOP Pillars** — the four pillars of OOP through interactive Unity mechanics. → `github.com/uv-interactives/uvi-learn-oop-pillars`

**Coming very soon — Unreal / UEFN / Fortnite track.** Bhuvanesh is close to releasing Unreal, UEFN, and Verse/Fortnite learning materials. Dev Lab is designed from day one as a **multi-engine library**: categories/tabs are content-driven, so an `Unreal`, `UEFN`, or `Fortnite/Verse` track appears the moment the records are added — zero code change. The card/lantern UI is engine-agnostic; each package just carries an `engine` tag for filtering and JSON-LD.

### Games — *The Dry Docks* (`/games`)
Turns "no games yet" into anticipation, honestly.
- **UV Originals — in development:** ships under construction in the docks, covered hulls under shimmering tarps, with a "Notify me" capture. *Coming soon*, no fake titles. These originals are expected to grow out of the studio's Unreal / UEFN / Fortnite work, so the section is built to showcase multiple engines as titles mature.
- **Partner work — Guess In 10:** the one shipped title, shown as a vessel that has set sail. **Credited clearly to Skillmatics as IP owner**; UV Interactives maintains it (50K+ downloads, Android & iOS). Links to the Skillmatics product page and the app stores.

### About — *The Studio* (`/about`)
Light and honest, **not recruiting-focused.** What UV Interactives is and what it's doing *now*: shipping free learning materials and building its own games. A brief founder note — Bhuvanesh, based in Chennai, **native of Madurai** (the one-line origin of the harbour's flavour) — and the studio's values (build, share, lift others). No dynasty history, no heavy CV.

### Contact — *Set Sail Together* (`/contact`)
Get-in-touch / start-a-conversation CTA, form, email, socials. Calm closing shot of the harbour at high tide.

### Global elements
NavBar, Footer, **Leo** the lion-cub AI guide (existing chatbot persona), a custom cursor, and a **loading screen where the tide comes in and the crowned-lion logo resolves** (no spinner). One buried easter egg: **clicking the lighthouse beam reveals "Games under construction — setting sail soon"** (a playful nod to the originals in development).

---

## 3. Technical Architecture

### Stack
- **Next.js (App Router)** — React Server Components for content + SEO; client components for interactivity.
- **React Three Fiber + drei + three** for the 3D harbour (client-only island, `dynamic(..., { ssr:false })`).
- **TypeScript** throughout (typed content models are central to the SOLID design).
- **Tailwind CSS** for 2D UI + design tokens.
- **Lenis** (smooth scroll) + **GSAP/ScrollTrigger** (scroll-driven sequences) + **Framer Motion** (component & page transitions).
- **Zustand** as the small shared store bridging scroll progress → 3D scene.
- Content via a **repository abstraction** with a local-data adapter now and an optional Sanity adapter later (mirrors your current mockData-with-CMS-fallback pattern).

### Why this satisfies SEO *and* 3D
Content pages are rendered on the server — crawlers receive complete HTML (headings, package data, metadata, JSON-LD). The `<Canvas>` never blocks that; it mounts after first paint, only on capable devices.

### Modular, loosely-coupled structure (feature-based, not type-based)
```
src/
  app/                      # Next.js routes (thin: compose features only)
    layout.tsx  page.tsx  lab/  games/  about/  contact/
  features/                 # one folder per page-feature, self-contained
    home/  devlab/  games/  about/  contact/
  scene/                    # the 3D harbour, isolated behind a facade
    Canvas.tsx  Ocean/  Lighthouse/  Palm/  Boats/  rig/  quality/
  shared/                   # cross-cutting UI kit (Button, SectionHeader, Cursor…)
  content/                  # typed content models + repository + adapters
    models/  repository.ts  adapters/local.ts  adapters/sanity.ts
  animation/                # Lenis + GSAP + Framer setup, scroll store, hooks
  lib/                      # seo (metadata, JSON-LD), analytics, utils
  styles/                   # tokens, tailwind
```

### SOLID, applied concretely
- **Single Responsibility** — `app/` routes only compose; features own their UI; `scene/` owns 3D; `content/` owns data.
- **Open/Closed** — content-driven: add a teaching package or game by adding a data record, no component changes.
- **Liskov / Interface Segregation** — narrow, typed content interfaces (`TeachingPackage`, `Game`), each with an `engine` field (`Unity` · `Unreal` · `UEFN` · `Verse/Fortnite`) so new engines are pure data; components depend on small prop contracts.
- **Dependency Inversion** — features depend on a `ContentRepository` *interface*, not on local files or Sanity directly. Swap the data source without touching the UI.

### Design patterns in play
- **Repository + Adapter** — `ContentRepository` with `LocalAdapter` (now) and `SanityAdapter` (later); silent fallback.
- **Strategy** — `QualityStrategy` (high / medium / low) for device tiers; `AnimationStrategy` for full vs reduced motion.
- **Provider** — React contexts for theme, quality tier, and scroll progress.
- **Facade** — `scene/` exposes one small API (`<Harbour scroll=… quality=… />`); the app never touches three.js internals.
- **Factory** — landmarks/props built from data (palm positions, boat = learner instances).
- **Observer** — ScrollTrigger + IntersectionObserver drive reveals and lazy mounting.

---

## 4. Animation System

Four layers, each with a clear job, composed so they never conflict:

1. **Lenis** — smooth-scroll foundation; everything reads its progress.
2. **GSAP + ScrollTrigger** — scroll-*driven* sequences: pinning the harbour, **scrubbing the rising tide**, parallax shore, section reveals. Feeds progress into the Zustand store.
3. **Framer Motion** — component enter/exit, **page transitions**, hover/tap micro-interactions, Leo the chatbot.
4. **R3F `useFrame` — procedural / generative motion** (always running, time-based):
   - **Ocean** — Gerstner-wave vertex displacement + fresnel + noise foam.
   - **Palms (Panai maram)** — simplex-noise wind sway in the vertex shader; instanced.
   - **Boats** — sine-based bob + drift; *vertical position bound to tide height* (the motto, in code).
   - **Lighthouse** — continuous gold beam sweep + soft glow.
   - **Ambient life** — light particles/pollen; optional subtle fish hint (the quiet twin-fish nod).
   - **Dawn light** — slow procedural sky/sun tint.

**The signature interaction:** scroll progress (GSAP → store) raises a single `tideHeight` value. Ocean, boats, and camera all read it. One number, scrolled by the user, makes the whole harbour rise. That's the award moment.

---

## 5. 3D Asset Pipeline (Blender → web)

You'll model assets in Blender; we keep them tiny and lazy-loaded so the site stays fast. (Existing island `.glb` files in uvi-website-3d can be referenced/cannibalised where useful.)

**Asset list (low-poly, stylized):**
- Palmyra palm — 1–2 variants, **GPU-instanced** along the shore.
- Lighthouse.
- Catamaran boat — the "learner" vessel, instanced.
- Pier / dock + harbour props (crates, nets, lamps).
- Optional: a small Leo lion-cub model on the docks; pearl/lantern accents.

**Per-asset budget & processing:**
- Draco **or** Meshopt geometry compression; **KTX2 / Basis** textures; baked lighting where possible.
- **LODs** + instancing for repeats (palms, boats).
- Target each asset well under ~300 KB compressed; scene loads progressively, low-poly first.
- **Lazy-loaded** via dynamic import + Suspense; canvas mounts only on capable devices after first paint.

---

## 6. Performance & Quality Tiers

A single capability check picks a tier at load:
- **High** (desktop / strong GPU): full ocean, foam, palms, boats, post-FX (bloom), pixel-ratio ≤ 2.
- **Medium** (most phones): simplified mesh, no post-FX, fewer instances, capped pixel-ratio, 30 fps cap if needed.
- **Low / reduced-motion / weak device**: **no WebGL** — a pre-rendered poster or short looping video of the harbour. Protects battery, accessibility, and SEO.

Plus: route-level code splitting, `next/image`, font optimization, transform-only animations, `IntersectionObserver` lazy mounting, and a real budget enforced via Lighthouse.

---

## 7. SEO Plan

- **Server-rendered content** on every page — crawlers get full HTML.
- **Metadata API** per route (titles, descriptions, OpenGraph/Twitter cards).
- **JSON-LD structured data:** `Organization` (UV Interactives), `Person` (Bhuvanesh), `Course` / `LearningResource` per teaching package, `VideoGame` for Guess In 10 and future originals.
- `sitemap.xml`, `robots.txt`, canonical URLs, semantic HTML, alt text.
- `prefers-reduced-motion` + non-WebGL fallback.

---

## 8. Content Carried Over (from uvi-website-3d)

- **Brand/config:** UV Interactives, founder, contact, socials, GitHub org.
- **Games:** **Guess In 10** only — credited to **Skillmatics (IP owner)**, maintained by UV Interactives (50K+ downloads). UV Originals listed as *in development*.
- **Dev Lab:** **Coin Rush** and **OOP Pillars** (the two real Unity/C# repos today). Built as a multi-engine library — **Unreal / UEFN / Verse / Fortnite** tracks drop in as data records when those materials release (very soon).
- **Leo** chatbot persona (lion-cub guide).
- **About:** light studio story + founder note (Chennai-based, Madurai native).

**Explicitly excluded:** any Visceral / HornbillFX references and their titles; the old Infibee module; the Pandya-history narrative; recruiting-led framing; "100 learners" claims.

All retained content moves into the typed `content/` layer — editable in one place, swappable to Sanity later without code changes.

---

## 9. Build Roadmap (modular, one at a time)

Built in dependency order; each phase is reviewable on its own.

- **Phase 0 — Foundation.** Next.js + TS scaffold, the folder architecture above, design tokens/theme (violet + gold), content layer (port retained data → typed models + repository), quality-tier + scroll providers, Lenis/GSAP/Framer wiring, SEO scaffolding. *(Skeleton, no visuals.)*
- **Phase 1 — Shared UI kit & layout.** NavBar, Footer, Button, SectionHeader, custom cursor, the tide + lion loading screen.
- **Phase 2 — 3D scene foundation.** Canvas, ocean shader, dawn lighting, camera rig, quality tiers, asset loader. *(First Blender assets land here.)*
- **Phase 3 — Home + the rising-tide scroll narrative.** The signature experience.
- **Phase 4 — Dev Lab (the Lighthouse).** Priority: the mission + SEO content (Coin Rush, OOP Pillars).
- **Phase 5 — Games (the Dry Docks).** Coming-soon originals + Guess In 10 (Skillmatics-credited).
- **Phase 6 — About (the Studio).** Light studio + founder story.
- **Phase 7 — Contact + Leo the guide.**
- **Phase 8 — Polish.** Perf pass, Lighthouse/SEO audit, accessibility, mobile fallback, analytics, the "games setting sail soon" easter egg.

---

*Next step:* on your go-ahead, I start **Phase 0** — scaffolding the `uv-i` Next.js project with this architecture and migrating the retained content layer. We review, then move down the list.
