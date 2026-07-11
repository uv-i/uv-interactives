# OOP Pillars (Screen Shift) — Four Pillars of OOP Teaching Package
### Unity 6.0+ · URP · 2-hour session

The **OOP Pillars** package contains **Screen Shift** — a coin-collecting mini-game
built entirely around a UI screen management system. Students build a `BaseScreen`
hierarchy — Splash, Loading, Gameplay HUD, and Game End screens — and discover all
four pillars of Object-Oriented Programming in a context they'll reuse in every real
project.

**📖 Full step-by-step tutorial series (start here if you're learning solo):**
**https://uvinteractives.com/lab/csharp/oop-pillars-00-setup** — 5 chapters,
one per pillar, with progress tracking.

---

## Chapter 0 — From Scratch (empty Unity → playing the game)

### Prerequisite
Unity basics: creating projects, prefabs, the Inspector. If that's fuzzy, do
**Coin Rush** first — https://github.com/uv-interactives/uvi-learn-coin-rush —
this package assumes it.

### 1. Create the project
Unity Hub → **New project** → **Universal 3D** template → name it `ScreenShift`.

### 2. Install the package
**Window → Package Manager → + → Add package from git URL:**
```
https://github.com/uv-interactives/uvi-learn-oop-pillars.git#1.0.0
```
Or embed directly in `Packages/manifest.json`:
```json
"com.uvinteractives.learn.oop-pillars": "https://github.com/uv-interactives/uvi-learn-oop-pillars.git#1.0.0"
```
A **ScreenShift** menu appears once the import finishes.

### 3. Bootstrap (~2 minutes)
1. **ScreenShift → Step 1 → Create ScriptableObjects** ← creates `Assets/ScreenShift/Data/GameData.asset`
2. **ScreenShift → Step 2 → Build Scene** ← builds the entire scene
3. One deliberate manual step: drag `GameData.asset` into the `_gameData` slot on each
   of the four screen GameObjects (Splash, Loading, GameplayHUD, GameEnd).
   *Why manual? Watching four different screens share one data asset IS the first OOP
   lesson — one contract, many implementations.*

### 4. Press Play
Splash fades in → Loading fills → HUD counts your coins → Game End reports the run.

### ✅ Checkpoint — all true before the session/tutorial continues
- [ ] **ScreenShift** menu visible, Console clean after import
- [ ] `GameData.asset` assigned on **all four** screen GameObjects
- [ ] Full flow plays: Splash → Loading → Gameplay → Game End

---

## Concepts Covered

| Pillar | File | What to search |
|--------|------|----------------|
| Encapsulation | `BaseScreen.cs`, `GameplayHUD.cs` | `// CONCEPT: ENCAPSULATION` |
| Abstraction | `BaseScreen.cs` | `// CONCEPT: ABSTRACTION` |
| Inheritance | `SplashScreen.cs`, `LoadingScreen.cs`, `GameplayHUD.cs`, `GameEndScreen.cs` | `// CONCEPT: INHERITANCE` |
| Polymorphism | `ScreenManager.cs` | `// CONCEPT: POLYMORPHISM` |
| ScriptableObject (bonus) | `GameData.cs` | `// CONCEPT: SCRIPTABLEOBJECT` |

## Session Order (2 hours)

1. **[0–15 min]** Play the game — run through all four screens
2. **[15–35 min]** `BaseScreen.cs` — Encapsulation: private fields, public methods only
3. **[35–55 min]** `BaseScreen.cs` — Abstraction: abstract class, the contract
4. **[55–80 min]** All four screen scripts — Inheritance: override, specialisation
5. **[80–100 min]** `ScreenManager.cs` — Polymorphism: `List<BaseScreen>`, single loop
6. **[100–110 min]** `GameData.cs` — ScriptableObject: live value tweaks
7. **[110–120 min]** Challenges review + Q&A

Each block has a matching web chapter with break-it-on-purpose exercises:
https://uvinteractives.com/lab/csharp

## Requirements

- Unity 6000.0+ · Universal Render Pipeline (URP) · TextMeshPro
