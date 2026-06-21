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

**Environment (harbour-specific — replace when swapping):**
- `src/scene/HarbourScene.tsx` — assembles lights, models, reveal, sky/fog, effects.
- `src/scene/Ocean.tsx` — the water shader.
- `src/scene/layout.ts` — model placements + `CAMERA`, mirrored from Blender.
- `public/models/*.glb`, `public/textures/uvi_palette.png` — the assets.
- Blender source of truth: `D:\uvi\Blender\uvi_website\UVI_Harbour.blend` (`UVI_Preview` scene).

## The contract

```ts
// src/scene/environment.ts
export interface SceneEnvironment {
  Scene: ComponentType;                 // owns its lights/models/reveal/sky/fog/effects; sets camera.lookAt
  camera: { position: [number,number,number]; target: [number,number,number]; fov: number };
}
export const activeEnvironment: SceneEnvironment = { Scene: HarbourScene, camera: CAMERA };
```

## To swap the environment

1. Build/export new assets (`.glb`) into `public/models/` (reuse the single palette atlas, or add one).
2. Create `src/scene/<NewScene>.tsx` — render inside `<Canvas>`, own its lights/models/sky/fog, drive entrances with `Reveal3D` + `revealStore`, add `<Effects/>`, and call `camera.lookAt(target)`.
3. (Optional) a `<new>Layout.ts` for placements + a `CAMERA` const (mirror coordinates from a Blender preview scene; Blender→three is `(x, z, -y)`, rotationY = Blender rotationZ).
4. In `src/scene/environment.ts`, import the new Scene + camera and set `activeEnvironment`.
5. Done. `SceneCanvas`, `SceneBackdrop`, all pages, content, UI, and providers stay untouched.

## Never changes when swapping
`app/`, `features/`, `content/`, `shared/`, `styles/`, the providers, and the engine files above. Only the environment module + `activeEnvironment` line.
