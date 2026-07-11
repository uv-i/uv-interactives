# UV Interactives — Site Roadmap

> Identity (everything hangs off this one line):
> **"Game developer who teaches through games."**
> Portfolio, tutorials, and playable games are all proof of that sentence.

Decisions locked (2026-07-11):
- Content system: **MDX files in this repo** (statically rendered). Sanity T2 is **cancelled**.
- 3D canvas: **unmounted on tutorial reading routes (`/lab/...` deeper than /lab)**. Live 3D on home / lab index / games / contact.
- Execution order: phases below, each shippable alone.

---

## Guiding principles

1. **Content before infrastructure.** Never build a route until at least one real
   tutorial exists to fill it. Biggest failure mode: 6 weeks of blog plumbing, 2 posts, stall.
2. **Tutorial pages are boring-fast.** Static, server-rendered, near-zero client JS,
   no WebGL. The 3D world is the showcase, not the reading room.
3. **QA gate for teaching packages:** nothing ships until someone can go from an
   *empty Unity project* to a *playable game* using only the tutorial. No implied prerequisites.
4. **YAGNI on future subjects.** Maths/Science/DSA/Java/TS via games = future product line.
   Today: taxonomy supports it, zero content built for it.
5. **No Unity WebGL builds in this repo.** 30–100MB builds blow Vercel limits.
   Host on itch.io / Unity Play / GitHub Pages; embed via iframe.

---

## Phase 1 — REFRAMED (2026-07-11): Studio story + case studies — PAUSED, do after Phase 3

Site now positions as **a one-person studio** ("UV Interactives — a one-person studio by
Bhuvanesh"), not a hire-me portfolio. Rules:
- Never fake-corporate ("we/our team") — solo is the selling point, not a weakness.
- The claim "pencil draft → store-published release" requires **evidence pages**:
  one case study per game/package showing sketch → prototype → build → release,
  with real artifacts from each stage.

**Current reality (2026-07-11):** zero self-published titles yet; one live commercial
title maintained under contract — **GuessIn10 (Skillmatics)**, already on the site
under Proud Partners. Narrative until first original release:
*"maintaining live commercial titles under contract while building original releases."*
- Label the engagement exactly ("live-ops & maintenance under contract") — never imply authorship.
- [ ] Confirm with Skillmatics contact that public listing is contract-safe (NDA/marketing clause).
- Solo + AI tooling = still solo. No disclaimers; optional positive frame:
  "one person, AI-augmented pipeline, full production stack." Rule: be able to
  explain every shipped line in an interview.

- [ ] Case study template + 1 case study per shipped title (GuessIn10 live-ops can be
      the first case study — a maintenance story is valid proof).
- [ ] Hero one-liner: studio identity + what it makes (games, tutorials, teaching packages).
- [ ] Resume PDF + contact stay reachable (footer/about), just not the headline.

**Done when:** a stranger can verify the pencil-to-store claim on screen without
being told it in an interview.

## Phase 2 — Content engine: `/learn` (≈1 week) ← DO FIRST

- [x] Route: `/learn/[topic]/[slug]` — topic taxonomy now: `unity | csharp | uefn | verse`.
      (Future: `maths | science | dsa | ...` — same route, zero new code.)
- [x] MDX in `src/content/learn/<topic>/<slug>.mdx` with frontmatter:
      `title, series, part, level, unityVersion, packageRepo, updated, description, draft`.
- [x] Series support: chapters via `series` + `part`, auto prev/next nav (`getSeriesNav`).
- [x] Static generation (`generateStaticParams`), no client fetches. Engine: `src/features/learn/learn.ts`.
- [x] **Unmount `SceneBackdrop` on `/learn`** — pathname gate inside `SceneBackdrop.tsx`
      (skips MobileBackdrop too). Body carries the themed flat background.
- [x] Code highlighting (Shiki via `rehype-pretty-code`, `github-dark-dimmed`, server-side).
- [x] `/learn` index (topic cards + coming-soon) and `/learn/[topic]` listing (series-grouped).
- [x] SEO: sitemap includes learn topics + posts, per-page metadata, JSON-LD `TechArticle`.
      OG images: inherited default for now — per-post OG images later.
- [x] Prose theming: `.learn-prose` in globals.css — pearl/gold CSS vars, auto dusk/dawn flip.
- [ ] Accessibility + Lighthouse pass after `npm install` + first real content.
- Note (2026-07-11 update): tutorials moved under **/lab** (Dev Lab merge — one learning
  destination); terrain sample deleted, replaced by real Coin Rush + OOP Pillars series.
  Drafts are hidden in production; flip `draft: false` after the Unity QA gate.

**Done when:** Lighthouse ≥95 (perf + a11y + SEO) on a tutorial page, mobile.

## Phase 3 — Content sprint (starts DURING phase 2, never ends)

Write in plain markdown first; engine renders whatever exists.

- [~] 2 flagship series WRITTEN (Coin Rush ch0–4, OOP Pillars ch0–4), paired to real
      GitHub packages, all `draft: true` — pending the Unity QA gate before publish.
      Progress tracking (localStorage), chapter rail, and home/DevLab wiring all live.
- [ ] Mandatory structure per tutorial:
  - **Chapter 0 — Prerequisites & setup:** Unity version, URP, project creation,
    terrain/environment building — every step the packages currently assume.
  - Chapters 1–N — build the game, concept-by-concept (mirror the package's
    concept-to-mechanic mapping).
  - Final chapter — install the finished package via UPM, compare, challenge tasks.
- [ ] Each tutorial validated by the QA gate (empty project → playable game, tutorial only).

**Done when:** 3 series live, each passing the QA gate.

## Phase 4 — Fix the package pipeline (root cause)

Website tutorials patch old packages; this stops producing broken ones.

- [ ] Update `unity-teaching-package` skill/template — every new package must include:
  - `Samples~/` complete demo scene importable via UPM, **or** a `SceneBootstrapper`
    that procedurally builds the full playable environment (zero manual setup), and
  - README "Chapter 0: from scratch" section that mirrors the web tutorial.
- [ ] Retrofit existing published packages (worst offender first — the terrain one).
- [ ] Each package README links to its web tutorial; each tutorial links back to repo.

## Phase 5 — Playable web games

- [ ] Export 1–2 small games to WebGL, host externally (itch.io embed is easiest).
- [ ] `/games` gets a "Play now" panel with the iframe (lazy-loaded, click-to-load
      so the 3D site never pays the cost until the user opts in).

## Phase 6 — Subject expansion (only after 1–4 have real traffic)

- Add topics to the taxonomy (`maths`, `science`, `english`, `java`, `typescript`,
  `system-design`, `dsa`). Route + engine already support it.
- Each subject launches with a playable game + its tutorial series — same QA gate.
- Kids VN / curriculum games plug in here as the product line.

---

## Explicitly cancelled / deferred

- **Sanity CMS (T2): cancelled.** Solo dev author — git MDX is versioned, free,
  statically rendered, no keys/cache/runtime fetches. Revisit only if a non-dev
  editor ever needs to publish.
- **Live 3D on reading pages: rejected** — contradicts perf + accessibility goals.
- **Future-subject content now: rejected** — YAGNI; taxonomy is the only prep.
- **WebGL builds in repo: rejected** — size/bandwidth.

## Metrics that tell us it's working

- Job goal: recruiter time-to-understanding < 30s (test on a friend), resume downloads.
- Reach: tutorial pages indexed + impressions in Google Search Console (add property at launch).
- Teaching: zero "how do I set up the scene?" questions from students on new packages.
