# Ponytail: Lazy Senior Dev Mode

> The best code is the code you never wrote.

## Core Decision Ladder

Before writing any code, work through this ladder in order:

1. **Does it need to exist?** Apply YAGNI — if it's not needed right now, don't build it.
2. **Is it in the standard library?** Use built-in solutions first.
3. **Is it a native platform feature?** Leverage what the runtime/framework already provides.
4. **Is it already an installed dependency?** Reuse what's already in `package.json`.
5. **Can it be one line?** Prefer a single expression over a function.
6. **Only then:** Write the minimum viable implementation.

## Rules

- No unrequested abstractions, wrappers, or helper utilities.
- No new dependencies when existing ones or stdlib suffice.
- No boilerplate "just in case" — only what the task requires.
- Prefer deletion over addition when both solve the problem.
- Favor simple, edge-case-correct solutions over clever ones.
- When a complex request seems unnecessary, say so before building it.

## Non-negotiable (never skip)

- Input validation at trust boundaries (user input, external APIs).
- Error handling that prevents data loss.
- Security and accessibility requirements.
- Anything the user explicitly requests.

## Testing

Non-trivial logic leaves **one** runnable check — a minimal assert or test file, no frameworks or fixtures. One-liners need no test.

## Comments

Mark intentional simplifications with a `ponytail:` comment noting known limitations and upgrade paths.

```ts
// ponytail: naive O(n²) sort — fine for <100 items, replace with sort() if list grows
```

---

# Caveman: Compressed Communication Mode

> why use many token when few token do trick

## Activation

Triggered by: "caveman mode", "talk like caveman", "less tokens", or `/caveman`. Stays active until "stop caveman" or "normal mode".

## Intensity Levels

- **lite** — drop filler/hedging, keep full sentences and articles
- **full** — remove articles, use fragments and short synonyms (default)
- **ultra** — abbreviate prose only; preserve all code, function names, error strings verbatim

## Rules

- Drop: articles, filler words, pleasantries, hedging language
- Keep: technical terms exact, code blocks unchanged, acronyms, exact error strings
- Never invent undecodable abbreviations
- Preserve user's dominant language
- No self-reference ("me caveman think") or tool-call narration
- No decorative tables or emoji dumps

**Pattern:** `[thing] [action] [reason]. [next step].`

## Auto-Clarity Exceptions

Resume normal style for: security warnings, irreversible action confirmations, multi-step sequences where compression risks misinterpretation.

---

# 3D Environment Template

The 3D world is a **swappable module**. The rest of the site (pages, content,
UI, providers) never imports the environment directly — only the generic mount
does. To replace the world, implement one contract and flip one import.

## Engine vs Environment

**Engine (generic — reuse, don't duplicate):**
- `src/scene/SceneCanvas.tsx` — the `<Canvas>`, tone mapping, shadows, DPR per tier.
- `src/scene/SceneBackdrop.tsx` — lazy/client-only mount, quality gating.
- `src/scene/environment.ts` — the `SceneEnvironment` contract + `activeEnvironment` switch.
- `src/scene/Effects.tsx` — tier-gated post-processing (bloom, vignette).
- `src/scene/DebugCamera.tsx` — `?cam` free camera that logs position/target.
- `src/scene/reveal/` — generic staged-reveal (`Reveal3D` + `revealStore`).
- `src/scene/quality/` — device tier detection.
- `src/scene/models/HModel.tsx` — glTF loader + palette-atlas filtering.

**Environment (world-specific — replace when swapping):**
- `src/scene/ArchipelagoScene.tsx` — ACTIVE world. Lazy-loads the 5 stage glbs + staged reveal.
- `src/scene/ArchipelagoCamera.tsx` — slow auto-orbit (the env's `cameraComponent`).
- `src/scene/archipelago/layout.ts` — `ARCH_MODELS` urls, `ARCH_STAGE`, camera, preload.
- `src/scene/HarbourScene.tsx` + `src/scene/layout.ts` — earlier world, kept as reference.
- `src/scene/Ocean.tsx` — the water shader (shared by both worlds).
- `public/models/archipelago/*.glb` (islands/peaks/structures/flora/dock), `public/textures/uvi_palette.png`.
- Blender source of truth: `D:\uvi\Blender\uvi_website\UVI_Harbour.blend` (`UVI_World` scene; `UVI_Preview` for harbour).

## The contract

```ts
// src/scene/environment.ts
export interface SceneEnvironment {
  Scene: ComponentType;                 // owns its lights/models/reveal/sky/fog/effects
  camera: { position: [number,number,number]; target: [number,number,number]; fov: number };
  stations: Station[];                  // scroll waypoints for the default CameraRig
  cameraComponent?: ComponentType;      // optional custom camera (e.g. orbit) — replaces CameraRig
}
export const activeEnvironment: SceneEnvironment = {
  Scene: ArchipelagoScene, camera: ARCH_CAMERA, stations: ARCH_STATIONS, cameraComponent: ArchipelagoCamera,
};
```

## To swap the environment

1. Build/export new assets (`.glb`) into `public/models/` (reuse the single palette atlas, or add one).
2. Create `src/scene/<NewScene>.tsx` — render inside `<Canvas>`, own its lights/models/sky/fog, drive entrances with `Reveal3D` + `revealStore`, add `<Effects/>`, and call `camera.lookAt(target)`.
3. (Optional) a `<new>Layout.ts` for placements + a `CAMERA` const (mirror coordinates from a Blender preview scene; Blender→three is `(x, z, -y)`, rotationY = Blender rotationZ).
4. In `src/scene/environment.ts`, import the new Scene + camera and set `activeEnvironment`.
5. Done. `SceneCanvas`, `SceneBackdrop`, all pages, content, UI, and providers stay untouched.

## Staged export + lazy reveal (the standard asset pipeline)

Do NOT export a world as one monolithic glb. Export **one glb per reveal stage** so
the browser lazy-loads each group over the network and animates it in on its own —
matching the harbour/`UVI_Preview` behaviour (assets appear one by one).

**Blender → web export (per stage):**
1. Bucket every object into reveal stages (by parent-empty / collection, NOT by name —
   pack object names are generic like `Cylinder.031`). Archipelago stages:
   `islands → peaks → structures → flora → dock`.
2. Export each bucket to `public/models/<world>/<stage>.glb` via a **temp scene**:
   create `bpy.data.scenes.new(...)`, link only that bucket's objects, set it active,
   then `export_scene.gltf(use_active_scene=True, use_selection=False, export_apply=True,
   export_yup=True, ...)`. Pitfalls learned the hard way:
   - `use_selection=True` leaks objects stuck-selected in excluded collections — avoid it.
   - default `use_active_scene=False` dumps ALL scenes into every file — always pass `True`.
   - keep transforms as node TRS (only `export_apply` = apply *modifiers*), so each group
     mounts at the origin and the pieces line up into the full world.

**Web side (lazy + staged):**
- `archipelago/layout.ts` lists `ARCH_MODELS` (one url per stage) + `preload`.
- `ArchipelagoScene` wraps each group in `Reveal3D` (mode `"rise"` = slides up from the
  sea) driven by `revealStore` stage timers. Flora uses `StaggeredGroup`, which scales in
  each top-level child one by one (per-index delay) for the "trees pop in" effect.
- Reduced motion → `revealAll()` (no animation).

## Never changes when swapping
`app/`, `features/`, `content/`, `shared/`, `styles/`, the providers, and the engine files above. Only the environment module + `activeEnvironment` line.

# Project State & Resume (keep current — read this first on a new chat)

Next.js 15 + R3F site for **UV Interactives**. Active 3D world = **ArchipelagoScene**
(persistent fixed canvas behind whole site). Dev: `npm run dev` (localhost:3000).

## Done
- 3D archipelago built in Blender (`UVI_Harbour.blend`, scene `UVI_World`), exported as
  5 stage glbs in `public/models/archipelago/` (islands, peaks, structures, flora, dock).
- Web env: lazy staged reveal, slow orbit camera (`ArchipelagoCamera`), ocean shader.
- **Dusk/Dawn/Auto themes** (`scene/theme/`): `themeStore` (zustand), `grade.ts` (all colours,
  single source), `SkyDome` (gradient sky + sun/moon + stars), `ThemeSync` (localStorage +
  `data-theme` on <html>), `GradedAtmosphere` lerps lights/fog/exposure. Toggle in NavBar.
  Three states: dusk 🌙 → dawn ☀️ → auto 🖥️. Auto follows `prefers-color-scheme` via
  `MediaQueryList`. 420ms CSS tween on bg/color/border/shadow during transitions (`.theme-transitioning`
  class added/removed). Dusk bloom OFF, Dawn bloom ON (`Effects.tsx`, reads `s.resolved`).
- Perf pass → ~60fps (was 10-15). See "Performance" below.
- Debug HUD (`scene/debug/`, top-right): FPS/draws/tris/geo/tex/programs. On in dev or `?debug`.
- Pages: Home (3D hero), Dev Lab, Games, Contact — all built, content in `content/data/`.
- Contact form (`features/contact/ContactForm.tsx`): EmailJS REST, keys in `.env.local`
  (`NEXT_PUBLIC_EMAILJS_*`, copied from old `uvi-website-3d`).
- About page + river were intentionally DROPPED.
- **AI backend (Gemini) — DONE.** One server route `app/api/leo/route.ts` (`runtime='nodejs'`)
  proxies Gemini `gemini-2.5-flash-lite`; key is server-side only (`GEMINI_API_KEY` in
  `.env.local`, blank in `.env.example`). One route, three `task`s:
  - `chat` — client sends `{task,input,system,history}` (system = `chatbot.systemPrompt`,
    last 10 msgs as history → mapped to Gemini `role:user|model`).
  - `polish` / `forge` — server owns the prompt; client sends just `{task,input}`.
  - Validation at the boundary: bad task→400, empty input→400, >4000 chars→413.
  - **Offline fallback:** no key OR upstream error → HTTP 200 `{text, offline:true}`
    (chat→Contact-page nudge, forge→"cooling down", polish→`''` so caller keeps original).
    Never throws to the client. Pure decision logic has a node smoke test (7/7) — re-run
    via the snippet in git history if route logic changes.
- **Leo chatbot — DONE.** `features/leo/Leo.tsx` (client), mounted GLOBALLY in
  `app/providers.tsx` (so it's on every page). Floating 🦁 launcher + chat window
  (framer-motion). Idle teaser bubble cycles `chatbot.facts` (90s), hidden on `/lab` + `/games`
  and when open. Reply keyword→route chips (inlined `PAGE_LINKS`/`extractLinks`). Listens for
  `window` event `leo:open` so the future 3D LeoOrb can open it. Reads persona by importing
  `chatbot` from `content/data/chatbot.ts` directly (static, no repository call). Uses
  `themeStore` for dusk/dawn skin (reads `s.resolved`), `next/navigation` for routing.
- **Idea Forge — DONE.** `features/devlab/IdeaForge.tsx` (client), embedded in `DevLabView`
  (server component renders the client island). Calls `/api/leo` `forge` task; renders the
  TITLE/GENRE/PITCH/MECHANIC/TWIST block as `<pre>`.
- **Contact "Polish with AI" — DONE.** Button on the message field in `ContactForm.tsx` →
  `/api/leo` `polish` task; replaces the textarea with the rewrite (keeps original if offline).

## Feature work completed (session 2+)
- **Vercel Analytics** — `@vercel/analytics/next` in `app/layout.tsx`. (T1)
- **Home page sections** — StatsSection, BuildPicker (3-tab platform picker), GamesSection preview,
  OpenSourceBanner, ForgeTeaser, PlatformStrip all built in `features/home/`. (T5–T9)
- **Content data files** — `content/data/home.ts` (stats, platforms, forgePosts),
  `content/data/services.ts` (4 services), `content/data/teaching.ts` (packages + coming-soon UEFN). (T14)
- **GamesPage tabs + timeline** — `GamesView` is now a client component with "UV Originals" /
  "Proud Partners" tabs, vertical timeline layout, TeaserCard (redacted title ████), PartnerCard. (T4)
- **GameDetailPanel** — spring modal with backdrop blur, YouTube embed, screenshot strip,
  store links, ←→ Esc keyboard nav, slide animation between games. (T3)
- **DevLab UI** — intro banner + GitHub CTA, AnimatePresence tab bar, PackageCard with
  active/coming-soon variants (`features/devlab/DevLabTabs.tsx` + `DevLabView.tsx`). (T15)
- **404 polish** — ghost "404", gold eyebrow, two nav CTAs (`app/not-found.tsx`). (T16)
- **Visual atoms** — `shared/ui/TiltWrapper.tsx` (3D tilt, DOM only, zero re-renders),
  `shared/ui/StatusBadge.tsx` (live/in-development/coming-soon), `shared/ui/ParticleField.tsx`
  (3-layer depth canvas, cursor parallax, publishes `--px`/`--py` CSS vars, screen blend). (T12)
- **Hooks** — `shared/hooks/useIdle.ts`, `shared/hooks/useMagnetic.ts` (NavBar links),
  `shared/hooks/useCountUp.ts` (IntersectionObserver + ease-out-quart, wired to StatsSection). (T13)
- **Game model extended** — added `role`, `partnerName`, `trailerYoutubeId`, `screenshots`,
  `playableUrl` optional fields to `content/models/index.ts`.
- **ParticleField mounted globally** in `app/providers.tsx` alongside Leo.
- **Architecture fixes** — 14 issues (3 critical + 11 warnings) all resolved. (T17)
- **Typography, frost panels, micro-interactions, page transitions** — T18–T21 all done.
- **Dawn theme full parity** — T22 done. Mobile 3D fallback + touch + dvh — T23 done.
- **NarrativeCamera** — killed auto-spin, added mouse parallax (T24), scroll-driven zoom (T25). (T24–T25)
- **Landmarks + LeoOrb** — mounted in ArchipelagoScene, LeoOrb fires `leo:open` event. (T26)
- **GradedAtmosphere rewrite** — fixed broken lighting: key light was using `bodyDir` (sun/moon
  horizon position) instead of `key.dir`; fill light was missing entirely. Now all three lights
  (key/fill/rim) lerp correctly to their own dir vectors from `grade.ts`.
- **Ocean dawn fog** — ArchipelagoScene now passes `fogColor={g.fog.color}`, `fogNear`, `fogFar`
  to `<Ocean>`. Previously defaulted to hardcoded dusk purple `#222a52` in both themes.
- **LighthouseBeam restored** — was accidentally dropped in a prior revert; re-added to
  ArchipelagoScene render tree. File `src/scene/LighthouseBeam.tsx` gates on `ARCH_STAGE.DOCK`.
- **"Explore in 3D" button restored** — was commented out in `HomeView.tsx`; re-enabled.
- **BottlePulse CTA** — `src/scene/BottlePulse.tsx`: clones `Bottle_New` from dock GLB using
  `src.clone(false)` (preserves baked position+quaternion+scale), swaps to `MeshStandardMaterial`
  with pulsing `emissiveIntensity` (0.6→2.5 sine). Scaled 1.08× + opacity 0.55 to avoid
  z-fighting with the original mesh. PointLight co-located for environmental spillover.
- **Shore foam (rewritten)** — `Ocean.tsx` uses a **1024×1024 top-down orthographic prepass** (not screen-space) so foam is world-anchored and camera-angle-independent. `prepassCam` is a separate `OrthographicCamera` covering the ocean plane; `LighthouseBeam` mesh is on **Three.js layer 2** and `prepassCam` only sees layer 0 — prevents the rotating triangle artifact. Fragment shader samples the terrain map via world XZ UV (not `gl_FragCoord`), 9-tap Gaussian blur (`bs=0.012`) for soft edges, pulse-animated band (`sin(time+pos)`) so foam breathes. Key gotchas: `enc < 0.001` = sky pixel = no foam; beam mesh on layer 2 requires `camera.layers.enable(2)` in `LighthouseBeam.tsx` so the main camera can still see it.
- **Boat buoyancy** — `src/scene/BoatBuoyancy2.tsx`: regex traverse (`BOAT_RE = /DG_Boat_Catamaran/`) to dodge Three.js name sanitization bug (`DG_Boat_Catamaran.001` → `DG_Boat_Catamaran001`). `HULL_LIFT=0.18`, `E=1.5`, `TILT=0.45`. Two-group JSX (outer stable world pos, inner per-frame Y+pitch+roll). Dock `<ArchModel>` uses `skip={(o) => BOAT_RE.test(o.name)}`. Imported by ArchipelagoScene.
- **Camera zoom system** — `src/scene/cameraStore.ts` (Zustand): `{ routeTarget: string|null, setRouteTarget, clearRouteTarget }`. `ROUTE_CAMERAS` added to `layout.ts` — per-route `{position, lookAt}` for `/games` (Docks `[15,1,13]`), `/lab` (Lighthouse `[29.5,7,-3]`), `/contact` (Bottle `[-11,0,13]`). Estimates — tune with `?cam&debug`. `NarrativeCamera.tsx` reads `routeTarget`: lerps to `ROUTE_CAMERAS[target]` at `LERP_ROUTE=0.03` (cinematic); null = heroProgress scroll zoom at `LERP_HOME=0.1`. Both position AND lookAt lerp.
- **Nav wired to camera** — `NavBar.tsx` + `LandmarkOverlay.tsx` both call `cameraStore.setRouteTarget(route)` on click. NavBar `useEffect` clears on `pathname==='/'`, sets on inner page arrival. LandmarkOverlay now uses `useRouter()` directly (removed Zustand bridge — it's not inside R3F canvas).
- **RevealGuard** — `providers.tsx`: watches `pathname`, calls `revealAll()` immediately when not on `/`. `reset()` removed from ArchipelagoScene cleanup (only `clearTimeout` now). Prevents strict-mode double-invoke from replaying island-rise on inner pages.
- **PageTransition** — `mode="wait"` → `mode="popLayout"`, `280ms` → `150ms`. New page appears without waiting for old page to fully exit.
- **Dawn frosted glass** — replaced claymorphism with warm frosted glass. `globals.css`:
  `rgba(242,235,218,0.65)` bg + `blur(22px) saturate(1.5)` + gold border + radial gradient overlays.
  Much more readable over the 3D than the "bleached" clay look.
- **Pearl token flip** — `html[data-theme='dawn']` sets `--c-pearl: 41 36 63` (dark ink) so all
  `text-pearl/X` Tailwind classes become dark-on-cream readable without touching any component.
- **Landmark placards theme-aware** — `LandmarkOverlay.tsx` reads `s.resolved` from themeStore,
  applies cream glass in dawn and dark glass in dusk via conditional inline styles.
- **3-state theme toggle** — dusk 🌙 → dawn ☀️ → auto 🖥️. Icon represents CURRENT state (not next).
  `ThemeSync.tsx` handles auto via `MediaQueryList` listener on `prefers-color-scheme`.
- **420ms theme tween** — `.theme-transitioning` CSS class added before switch, removed after 450ms.
  Transitions only active during switch (perf optimization vs always-on `*` transitions).
- **Loading screen SSR fix** — `LoadingScreen` was `dynamic({ ssr: false })` causing a flash: browser received hero HTML, JS mounted the overlay late, content flashed then hid. Fix: direct import (no dynamic), `visible: true` initial state renders on server, `useReducedMotion` moved entirely into `useEffect` to avoid hydration mismatch. No more flash.
- **Landmark placards hidden on mobile** — `LandmarkOverlay.tsx` returns `null` when `vw < 768`. Both themes. The `useViewport` hook already tracked `vw`; one early-return line.
- **Vercel Speed Insights** — `@vercel/speed-insights/next` `<SpeedInsights />` added to `app/layout.tsx` alongside `<Analytics />`.

## Still TODO
- **T2** — Sanity CMS: port `sanityClient`, GROQ queries, `useGamesData`/`useDevLabData` with 1hr
  localStorage cache + silent fallback. Keys: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`.
- Optional: run `npm run build` on Windows to confirm prod bundle (sandbox SWC missing).

## AI / env note
- `GEMINI_API_KEY` is **server-side only** — never prefix `NEXT_PUBLIC`. Reused from old
  `uvi-website-3d` (`VITE_GEMINI_API_KEY`). With the key blank the whole AI surface still works,
  just returns the offline fallbacks — safe to ship without a key.
- To swap AI provider: change `MODEL` + `callGemini` in `app/api/leo/route.ts` only; the three
  client callers (Leo, IdeaForge, ContactForm) are provider-agnostic (`fetch('/api/leo', …)`).

## Performance (root causes + fixes — don't regress these)
- Bottleneck was draw calls (1420!) + fill-rate, NOT triangles.
- `scene/archipelago/merge.ts`: `mergeByMaterial` (merge static groups by material → ~110
  draws) + `cheapMaterial`/`cheapenMaterials` (MeshStandard → **MeshLambert**, cheap lighting).
  ArchModel merges; flora uses `cheapenMaterials` (kept separate for per-tree stagger).
- Ocean fragment: NO per-pixel fbm (foam from wave height only). Vertex fbm kept.
- `Effects.tsx`: multisampling 0 (no MSAA), bloom dawn-only.
- DPR capped ([1,1.5] high). Quality tier read via `scene/quality/qualityStore` (zustand) —
  React context does NOT cross the R3F canvas, so use the store inside the canvas, not `useQuality`.

## Readability / theming gotchas (IMPORTANT)
- Inner pages (Dev Lab/Games/Contact) + Footer use the **`.frost-panel`** class
  (`globals.css`): frosted dark panel over the 3D so text is readable. Home hero has no
  frost (full 3D + scrims).
- **Light/Dark UI flip** is done with scoped CSS in `globals.css` under
  `html[data-theme='dawn'] .frost-panel` / `html[data-theme='dawn'] header.fixed` (literal colours,
  works without a dev restart). Dusk = default dark skin; Dawn = light cream skin + dark text.
  If adding new inner-page UI, give it `.frost-panel` (or it won't theme).
- **NavBar selector MUST be `header.fixed`** — `html[data-theme='dawn'] header` matches ALL
  `<header>` HTML elements including `SectionHeader`'s internal `<header>` tag, causing white
  patches on section titles. Always scope to `header.fixed`.
- Brand colours in `globals.css` are RGB-channel triplets and Tailwind colours use
  `rgb(var(--x) / <alpha-value>)` so opacity utilities (`bg-violet-night/85`, `text-pearl/70`)
  work. **Tailwind config + env-var changes need a `npm run dev` restart** to take effect.
  NavBar uses literal `bg-[rgba(22,11,50,0.72)]` to avoid depending on that.

## Theme system architecture (IMPORTANT — `themeStore.ts`)

```ts
type ThemeName = 'dusk' | 'dawn' | 'auto';
// theme  = what user selected (can be 'auto')
// resolved = always 'dusk' | 'dawn' — safe for 3D grade lookups
```

**ALL 3D scene files must use `s.resolved`, never `s.theme`.** `THEME_GRADE['auto']` is
undefined — using `s.theme` in a scene file crashes with "cannot read property of undefined".
Affected files: `ArchipelagoScene.tsx`, `Effects.tsx`, `LighthouseBeam.tsx`, `SkyDome.tsx`,
`Leo.tsx` (anywhere that does `THEME_GRADE[s.theme]` or `s.theme === 'dawn'` in a 3D context).

**Zustand infinite loop trap:** `ThemeSync.tsx` subscribes to store changes to apply theme to DOM.
If `applyResolved()` calls `setResolved()` unconditionally, and the subscriber fires on `resolved`
changes, you get infinite recursion. Two guards required:
1. `if (useTheme.getState().resolved !== resolved) setResolved(resolved)` — equality check before write.
2. `useTheme.subscribe((s, prev) => { if (s.theme !== prev.theme) applyTheme(s.theme); })` — subscribe
   only to `theme` changes, not `resolved`, to avoid feedback loop.

**Theme icon mapping:** icons represent CURRENT state, not next state.
`{ dusk: <Moon />, dawn: <Sun />, auto: <Monitor /> }` — if you see it wrong, it was
previously inverted (`{ dusk: <Sun />, dawn: <Monitor />, auto: <Moon /> }`).

## Sandbox/file note (for the agent)
The Linux sandbox has several known failure modes — read this before touching files:

**File write failures (most common):** The `Edit` tool writes to a sandbox cache that does NOT
always reach the actual mounted disk. After any `Edit`, run `git diff <file>` in bash to confirm
the change is on disk. If git shows no diff, the write was lost — use bash heredoc instead:
`cat > /sessions/…/mnt/uv-i/src/... << 'EOF' … EOF`. This is the reliable write path.

**Never use the Edit tool for files > ~390 lines** — it silently truncates. Use bash heredoc
or write a Python script.

**Targeted string replacement without full rewrite:** For a single-line change in a large file,
use `sed -i 's/old/new/' file` in bash — faster and safer than a full heredoc rewrite.
Verify with `grep 'new pattern' file` after.

**File truncation from Python string replacement:** If using Python to replace a function block,
always verify `wc -l file` before and after. A botched replace that leaves an unclosed JSX tag
(`</u` at EOF) will silently break the whole file. Restore with `git show HEAD:path > /tmp/base`
then re-apply only the targeted change.

**Null-byte corruption:** Sandbox can embed null bytes in source files (grep reports "binary
file matches"). Strip with: `tr -d '\000' < file > /tmp/clean && cp /tmp/clean file`.
⚠️ NEVER run `tr -d '\000'` on `.glb` files — GLBs are binary and null bytes are data.
Restore corrupted GLBs with: `git checkout HEAD -- public/models/archipelago/<file>.glb`.

**Restoring files from git:** `git checkout HEAD -- <file>` restores the last committed version
but destroys any uncommitted changes. Commit frequently after each meaningful batch.

**Live UI inspection:** Claude-in-Chrome at localhost:3000. The orange control border/cursor
are the Chrome extension UI, NOT site bugs.

## 3D scene gotchas (learned the hard way)

**`grade.ts` — `bodyDir` vs light dirs:** `bodyDir` is the sun/moon disc position in `SkyDome`
(near horizon, e.g. `[40,12,-100]`). Do NOT use it for directional lights. Use `key.dir`,
`fill.dir`, `rim.dir` instead — these are separate steep-angle positions that actually illuminate
rooftops and walls.

**`GradedAtmosphere`:** Three directional lights (key/fill/rim). All lerp toward their respective
`dir` vectors from `grade.ts` each frame. JSX must render all three refs:
`<directionalLight ref={key} position={d.key.dir} />` etc (using dusk defaults as initial mount).

**Ocean fog:** Must pass `fogColor={g.fog.color} fogNear={g.fog.near} fogFar={g.fog.far}` to
`<Ocean>` in ArchipelagoScene. Without this, Ocean uses its own hardcoded dusk purple fallback
in both themes — the horizon won't blend with dawn sky.

**Glow overlays on GLB meshes:** Use `src.clone(false)` (shallow clone) — it preserves the
node's baked position + quaternion + scale from the GLTF scene graph. Do NOT try to re-apply
position/rotation manually. To avoid z-fighting: scale the clone 1.05–1.10× and set opacity
0.4–0.6 with `transparent: true`. Use `MeshStandardMaterial` (not `MeshLambertMaterial`) for
emissive pulsing via `emissiveIntensity` in `useFrame`.

**GLB node parsing (Node.js):** To find a named node's world position/quaternion/scale in a
GLB without running Three.js: `buf.readUInt32LE(12)` = JSON chunk length,
`buf.slice(20, 20+jsonLen)` = the GLTF JSON. Parse and walk `nodes` array by name.

**Ocean prepass + Three.js layers:** The worldY prepass must use a dedicated `OrthographicCamera` (not the main camera) or foam maps to screen-space and creates square/triangular artifacts that track camera movement. Any rotating/non-terrain mesh (e.g. `LighthouseBeam`) captured in the prepass appears as a rotating foam shape. Fix: `mesh.layers.set(2)` on the offending mesh + `prepassCam.layers.disableAll(); prepassCam.layers.enable(0)`. Then add `camera.layers.enable(2)` in that component so the main render camera can still see it. Default camera mask = layer 0 only — `layers.set(2)` makes a mesh invisible to the main camera unless you explicitly enable layer 2 on it.
