# uv-i Feature Backlog
> Porting missing features from uvi-website-3d → uv-i (Next.js 15 / TypeScript)
> Check off as done. Never delete — strike through if dropped intentionally.

---

## 🔴 High Priority — Functional

- [ ] **Vercel Analytics** — add `@vercel/analytics/next` to `app/layout.tsx`
- [ ] **Sanity CMS** — port `sanityClient`, GROQ queries, `useGamesData` + `useDevLabData` hooks with 1hr localStorage cache + silent fallback to local data
- [ ] **GameDetailPanel** — slide-over modal: YouTube trailer, screenshot strip, store links, keyboard nav (←→ Esc), scroll lock, Framer Motion spring
- [ ] **GamesPage tabs** — UV Originals / Proud Partners tab switcher, vertical timeline layout, `TeaserCard` (redacted title), deep-link routing state `{ tab, gameIndex }`

---

## 🟠 Home Page — Missing Sections

- [ ] **StatsSection** — 4 animated stat cards, `useCountUp` hook, TiltWrapper
- [ ] **BuildPicker** — 3-way platform picker (Mobile / WebGL / Fortnite) with expandable detail panel + CTA
- [ ] **GamesSection** — 3 partner game preview cards on homepage
- [ ] **OpenSourceBanner** — "open source by default" GitHub CTA strip
- [ ] **ForgeTeaser** — "From the Forge" blog post placeholder cards section
- [ ] **PlatformStrip** — platform tag pills row
- [ ] **ShowreelSection** — YouTube embed (wire up `showreelYoutubeId` in `config.ts`, hidden until set)
- [ ] **PackagesSection** — Dev Lab UPM package preview cards on homepage

---

## 🟡 3D Island — Interactive Mode

- [ ] **IslandView toggle** — opt-in full-screen 3D mode, `islandState` localStorage persistence, WebGL guard
- [ ] **TransitionCurtain** — Framer Motion full-screen curtain with "◈ UV INTERACTIVES" reveal between 2D↔3D
- [ ] **Landmark system** — invisible 3D hit boxes + `<Html>` placards linking to pages (`landmarks.ts` data)
- [ ] **LeoOrb** — glowing clickable orb in Archipelago scene firing `leo:open` window event
- [ ] **Island HUD** — `TitleHUD`, `StatsHUD`, `HintBar`, `BackButton`, `LoadingOverlay` overlay layer

---

## 🟢 Visual Atoms & Hooks

- [ ] **TiltWrapper** — perspective-tilt card with specular glare + border glow (`use3DTilt` hook)
- [ ] **ParticleField** — 3-layer depth particle field with cursor parallax + `--px`/`--py` CSS vars
- [ ] **MouseParticleBackground** — cursor-repelling canvas particle network
- [ ] **StatusBadge** — smart status badge (`live` / `development` / `other`)
- [ ] **`useCountUp`** — scroll-triggered number animation (used by StatsSection)
- [ ] **`useMagnetic`** — magnetic hover drift + `--gx`/`--gy` CSS vars (NavBar links)
- [ ] **`useIdle`** — idle detection after N ms (Leo fact cycling already uses inline version — extract if reused)

---

## 🔵 Content Data

- [ ] **STATS** — 4 stat entries (value, label, icon) in `content/data/stats.ts`
- [ ] **STUDIO_STATS** — compact 3-pill HUD version in `content/data/stats.ts`
- [ ] **BUILD_OPTIONS** — 3 platform picker entries (Mobile/WebGL/Fortnite) in `content/data/buildOptions.ts`
- [ ] **PLATFORMS** — platform tag array in `content/data/platforms.ts`
- [ ] **FORGE_POSTS** — 3 blog post placeholders in `content/data/forge.ts`
- [ ] **`showreelYoutubeId`** — add to `config.ts` (null until video ready)
- [ ] **Chatbot fact `state` field** — add optional `state: { tab?, gameIndex? }` to `ChatbotFact` type for Leo deep-link nav

---

## ⚪ DevLab UI

- [ ] **Intro banner** — `<FlaskConical>` icon + teaching philosophy text + GitHub org CTA button
- [ ] **Tab bar UI** — category tabs with count label (`{tab} · {n} published`)
- [ ] **PlaceholderCard** — "More Coming Soon" card at end of grid

---

## ⚫ Polish

- [ ] **404 page** — gradient `404`, lion emoji, "Lost in the map?", two nav buttons (Home + "See My Work")
- [ ] **Leo deep-link state** — pass `{ tab, gameIndex }` state via `router.push` from Leo chip clicks
