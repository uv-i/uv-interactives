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
- ~~T2 Sanity CMS~~ — **CANCELLED** (2026-07-11): solo dev author, git MDX won. See ROADMAP.md.
- Review + test the two draft tutorials in Unity, then flip `draft: false` to publish.
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

# Session 3+ — Learn engine, Dev Lab merge, fixed chrome (2026-07-11)

**Strategy lives in `ROADMAP.md` (repo root) — read it alongside this file.** Key decisions:
site = one-person studio ("studio of one", never fake-corporate "we"); content = MDX in git
(Sanity cancelled); GuessIn10 (Skillmatics) is *contract live-ops*, never imply authorship;
QA gate: no tutorial ships unless empty Unity project → playable game using only the tutorial.

## Learn/tutorial engine (DONE)
- **Content:** `src/content/learn/<topic>/<slug>.mdx`. Frontmatter: `title, description,
  series, part (0 = setup chapter), level, unityVersion, packageRepo, updated, draft`.
  `draft: true` → visible in dev, hidden in prod builds. Topics registry `TOPICS` in
  `src/features/learn/learn.ts` (unity/csharp/uefn/verse; future subjects = add key + folder).
- **Engine:** `src/features/learn/learn.ts` — fs + gray-matter at build time, `server-only`.
  `getPostsByTopic`, `getAllPosts`, `getPost`, `getSeriesNav` (prev/next by `part`).
- **Routes:** `/lab/[topic]/[slug]` article (MDXRemote RSC + rehype-slug + rehype-pretty-code
  `github-dark-dimmed`), `/lab/[topic]` listing. `generateStaticParams` + `dynamicParams=false`.
- **Clubbed with packages:** `app/lab/page.tsx` builds `tutorialsByRepo()` — matches tutorial
  series to packages **by exact `packageRepo` frontmatter == `pkg.githubUrl`** → PackageCard
  shows "Start the tutorial — N chapters" CTA (DevLabTabs). Separate LearnSection was
  built then DELETED — packages and tutorials are one card now. IdeaForge moved below tabs (`mt-20`).
- **3D gate:** `SceneBackdrop.tsx` returns `null` when `pathname.startsWith('/lab/')`
  (deeper than /lab = reading page = flat + no WebGL). `/lab` itself keeps the 3D.
- **Prose theming:** `.learn-prose` in globals.css overrides `--tw-prose-*` with
  `rgb(var(--c-pearl)/…)` + gold → auto dusk/dawn flip. Code blocks stay dark in both themes.
- **Deps added** (npm install MUST run on Windows, never in sandbox — clobbers win32 SWC):
  next-mdx-remote, gray-matter, rehype-pretty-code, rehype-slug, shiki, server-only,
  @tailwindcss/typography (+ plugin in tailwind.config.ts).
- **Tutorials:** `unity/coin-rush-00-setup.mdx`, `csharp/oop-pillars-00-setup.mdx` — both
  `draft: true`, written from real repo READMEs, UNTESTED in Unity. Learning path:
  Coin Rush → OOP Pillars (aka "Screen Shift" — naming mismatch pending user decision).
  Repo bug reported to user: oop-pillars README install URL has `[your-org]` placeholder.

## Site chrome (DONE)
- **NavBar frosted:** `bg-[rgba(22,11,50,0.55)] backdrop-blur-xl backdrop-saturate-150`;
  dawn override in globals.css at 0.65 alpha.
- **Footer = slim fixed status bar:** `h-12`, `frost-panel !fixed inset-x-0 bottom-0 z-[60]`,
  single row. `main` has `pb-12` clearance (= footer height exactly). Leo launcher/teaser/window
  all shifted +40px up (`bottom-16` / `bottom-[9.5rem]` / `bottom-[8.5rem]`) to clear it.
- **Typography scale (uniform):** page/section titles `text-3xl sm:text-4xl font-bold`;
  eyebrows `text-xs uppercase tracking-widest text-gold`; body `text-pearl/65`.
  Home hero intentionally bigger (display type). Don't reintroduce `font-black` page titles.

## New gotchas (hard-won)
- **`.frost-panel` sets `position: relative`** and loads after Tailwind utilities → it BEATS
  the `fixed` class. Any positioned frost element needs `!fixed` (or wrapper). Bit us on Footer.
- **Sandbox corruption modes confirmed this session:** package.json truncated mid-write;
  NavBar.tsx null-byte corrupted (fix: `git checkout HEAD --` when net change is zero);
  sitemap.ts trailing nulls (`tr -d '\000'`); DevLabView/SceneBackdrop truncated (heredoc rewrite).
  ALWAYS null-check + tail-check every written file: python `b'\x00' in bytes` — plain
  `grep -qP '\x00'` MISSES them.
- **`.git/index` can corrupt too** ("bad signature 0x00000000"). Fix: `rm .git/index && git reset`.
  If rm says "Operation not permitted", call the cowork `allow_cowork_file_delete` tool first —
  it unlocks deletion for the whole mounted folder (also required for deleting any repo file).
- **Never `git reset --hard` to clean up** — tracked-file edits from other sessions die.
  Surgical `git checkout HEAD -- <paths>` only.
- **`tsconfig` includes `.next/types`** — stale/corrupt build cache breaks `tsc --noEmit`;
  `rm -rf .next` is safe (regenerates).
- **SectionHeader props are `eyebrow/title/subtitle`** (not `description`).

## Session 4 additions (2026-07-11, progress tracking)
- **Tutorial progress system:** `src/features/learn/progress.ts` (zustand persist,
  key `uvi_learn_progress`, "visited = completed") + `ChapterRail.tsx` (left index rail
  xl+, inline bar below xl). CTAs on DevLab cards + home Forge cards are progress-aware
  via `useSeriesCta` (Start → Continue — Chapter X → Completed). SSR-safe via `useMounted`.
- **`backdrop-filter` creates a containing block for `position: fixed` descendants** —
  anything `fixed` inside `.frost-panel` scrolls with the page. Fix: `createPortal(..., document.body)`
  (ChapterRail) or put the fixed element outside frost ancestors. Same trap as transform/filter.
- **Zustand selector must not fabricate values:** `useStore((s) => s.x ?? [])` returns a
  fresh `[]` each read → React "getSnapshot should be cached" infinite-loop warning.
  Select the raw value, apply the fallback outside with a module-level constant.
- Home order now: Hero → Stats ("Studio of one. Real impact.") → ForgeTeaser (live
  tutorials) → GamesSection → Services → OpenSourceBanner → BuildPicker.
- PUBLISHED (2026-07-11): Coin Rush ch0–9 + OOP Pillars ch0–4, all `draft: false`.
  Coin Rush chapter map: 0 setup, 1 variables, 2 ScriptableObjects, 3 interfaces,
  4 events, 5 collections, 6 casting, 7 enums, 8 coroutines, 9 singleton+finale.
  Owner approved publish before Unity run-through — QA pass still owed.

## Session 4 (cont.) — home polish + hero click bug (2026-07-11)
- **Hero CTA buttons:** both `variant="ghost"` (equal weight, deliberate — dual audience).
  They link to /lab and /games via `Button href`.
- **LandmarkOverlay click-shield bug (major):** its scroll handler did
  `style.pointerEvents = ''` near scroll-top, which ERASES React's inline
  `pointer-events: none` → invisible fixed inset-0 z-50 div swallowed all hero clicks.
  Fix: wrapper keeps `pointer-events: none` always; fade-on-scroll now toggles
  `visibility` (also correctly disables placard hit-testing when hidden).
  Lesson: `el.style.x = ''` clears the whole inline property, including what React set.
- **Home game cards → /games:** overlay-link pattern (absolute inset-0 z-[1] Link inside
  relative card; attribution <a> gets z-[2]) — avoids nested-anchor invalid HTML.
  Partner cards deep-link `/games?tab=partners`.
- **Games tab deep link:** GamesView reads `?tab=partners` via `window.location` in a
  `useEffect` (NOT `useSearchParams` — that hook forces a Suspense boundary on static pages).
- **GamesSection header honesty:** "Games we've shipped." → "Games we build & maintain."
  + live-ops subtitle. Never imply authorship of GuessIn10 anywhere.
- **DevLabTabs/DevLabView + learn.ts corruption count:** DevLabView truncated 3× total,
  learn.ts 1× — ALWAYS rewrite these via bash heredoc, never the Edit tool.
- Possible future: `?game=<id>` deep link to auto-open GameDetailPanel (same pattern).

## Future package workflow (2026-07-11)
Two-skill pipeline, one session, no re-explaining:
1. `unity-teaching-package` (upgraded .skill installed by user) → builds the package
   repo: scripts, bootstrapper (complete environment), README family incl. Chapter 0.
2. `package-to-tutorial` (new .skill, delivered 2026-07-11) → give it the GitHub URL:
   clones, reads real scripts, proposes a chapter map, writes MDX series into
   `src/content/learn/<topic>/`, ensures teaching.ts githubUrl matches packageRepo.
   Chapters land `draft: true`; owner reviews + QA-gates + flips.
The skills encode the frontmatter contract, chapter voice, sandbox write rules, and
the exact-URL matching — a new chat with this folder connected + both skills = full flow.

## next-mdx-remote v6 (2026-07-11, deploy fix)
- Bumped ^5 → ^6 (Vercel flagged v5 security advisory). v6 BLOCKS JS expressions in
  MDX by default (`blockJS`/`blockDangerousJS: true`). Our chapters are pure markdown —
  unaffected. If a future chapter needs JSX/`{expressions}`, pass `blockJS: false` in
  mdxOptions consciously. NOTE: hashicorp archived the repo (Apr 2026) — v6 is the final
  version; if it ever breaks with a Next upgrade, migrate to `@next/mdx` or `mdx-bundler`.

# CURRENT STATUS (2026-07-11, end of session — read this block first when resuming)

## Where the project stands
- Phases 2, 3, 4 of ROADMAP.md: DONE. Phase 1 (case studies) and 5 (playable WebGL) open.
- 15 tutorial chapters PUBLISHED (`draft: false`): Coin Rush ch0–9 (unity), OOP Pillars
  ch0–4 (csharp). All grounded in the real repo scripts (cloned + read, never invented).
- Site features live: progress tracking + chapter rail, package↔tutorial clubbed cards,
  home Forge shortcuts (progress-aware), frosted NavBar, slim !fixed footer, games tab
  deep-link (?tab=partners), uniform type scale, hero equal-weight ghost CTAs.
- Deploys on Vercel. next-mdx-remote bumped ^6 (v5 security advisory) — pure-markdown
  chapters unaffected; repo is archived upstream, migration path = @next/mdx if ever needed.

## Deliverables handed to owner (in outputs / repo)
- `unity-teaching-package.skill` — upgraded skill (complete-environment bootstrapper rule,
  README Chapter 0 mandate, URL contract, placeholder ban, QA-gate final check).
- `package-to-tutorial.skill` — NEW skill: GitHub repo URL → approved chapter map →
  MDX series wired into site. Encodes frontmatter contract + chapter voice + sandbox rules.
- `phase4-retrofit/` (in this repo) — commit-ready READMEs for both package repos
  (Chapter 0 sections, tutorial cross-links, oop-pillars `[your-org]` 404 URL fixed).

## Pending OWNER actions (the session's open loop)
1. `npm install` on Windows (picks up next-mdx-remote ^6 and earlier MDX deps), then
   `npm run dev` spot-check + `npm run build` before deploy.
2. Install both .skill files (Save-skill button / Settings > Capabilities).
3. Commit the two retrofit READMEs into their GitHub repos; delete `phase4-retrofit/`.
4. Unity QA pass on both series (chapters published before the run-through — owed).
5. Confirm with Skillmatics that the public listing is contract-safe.
6. Optional: coin-rush menu label fix ("2." runs before "1.") → 1.0.1 tag.

## Key contracts (do not drift)
- Tutorial frontmatter `packageRepo` == `teaching.ts` `githubUrl`, exact string — this
  match drives every package↔tutorial link on the site.
- New chapters ALWAYS land `draft: true`; publishing is the owner's explicit act.
- Identity line: "Game developer who teaches through games" / studio-of-one voice,
  never "we/our team"; GuessIn10 = contract live-ops, never authorship.
