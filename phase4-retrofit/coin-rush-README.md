# Coin Rush — C# Teaching Demo
### Unity 6.0+ · URP · 3D Top-Down Collector · 2-hour session

A complete Unity package built to teach C# fundamentals in a 2-hour live session.
Every script is annotated with the concept it demonstrates — search `// CONCEPT:` to
find them all.

**📖 Full step-by-step tutorial series (start here if you're learning solo):**
**https://uvinteractives.com/lab/unity/coin-rush-00-setup** — 10 chapters, from empty
project to the final challenge round, with progress tracking.

---

## Chapter 0 — From Scratch (empty Unity → playing the game)

No prerequisites assumed. If you have Unity Hub installed, this section is everything.

### 1. Create the project
1. Unity Hub → **New project** → pick the **Universal 3D** template (URP).
2. Name it `CoinRush`, **Create project**.

> Pink materials later? You picked the Built-in template — the package targets URP.
> Pink = wrong pipeline, not a broken download.

### 2. Install the package
**Window → Package Manager → + → Add package from git URL:**
```
https://github.com/uv-interactives/uvi-learn-coin-rush.git#1.0.0
```
(Alternative: Code → Download ZIP on GitHub, unzip outside your project,
then **Add package from disk…** → select `package.json`.)

A **CoinRush** menu appears in the menu bar. No menu → check the Console before continuing.

### 3. Bootstrap — data first, then scene
1. **CoinRush → 2. Create Default ScriptableObjects** (creates CoinData + EnemyData assets)
2. **File → New Scene**, then **CoinRush → 1. Build Scene** (arena, player, spawners, lighting)

### 4. Create the two prefabs (deliberate manual steps — prefab-making is a lesson)
**Coin:** 3D Object → Cylinder, name `Coin`, scale Y ≈ 0.1 → Add Component `Coin` →
tick **Is Trigger** on its collider → assign the `CoinData` asset → drag to Project
window (making it a prefab) → delete from Hierarchy.

**Enemy:** 3D Object → Sphere, name `Enemy` → Add Component `EnemyController` →
assign `EnemyData` → drag to Project window → delete from Hierarchy.

### 5. Wire spawners and UI
1. Select **CoinSpawner** → drag the Coin prefab into its slot.
2. Select **EnemySpawner** → drag the Enemy prefab in.
3. **GameObject → UI → Canvas** → add two **Text - TextMeshPro** fields (import TMP
   Essentials when prompted) → select **UIManager** → drag each text field into its slot.

### 6. Press Play
WASD to move. Coins score, enemies hurt.

### ✅ Checkpoint — all true before the session/tutorial continues
- [ ] Universal 3D (URP) template
- [ ] **CoinRush** menu visible, Console clean after import
- [ ] Coin + Enemy prefabs exist and are assigned to their spawners
- [ ] Score and health UI update while playing

---

## Concepts covered

| File | Concept |
| ---- | ------- |
| `ICollectable.cs` / `IDamageable.cs` | Interface |
| `CoinData.cs` / `EnemyData.cs` | ScriptableObject |
| `EnemyData.cs` / `EnemyController.cs` | Enum + switch state machine |
| `GameEvents.cs` | C# events + delegates (observer pattern) |
| `GameManager.cs` | Singleton, properties, coroutine, event subscription |
| `CoinSpawner.cs` / `EnemySpawner.cs` | List, coroutine, Instantiate |
| `Coin.cs` | Interface implementation, coroutine, event raising |
| `PlayerHealth.cs` | Interface implementation, property, invincibility coroutine |
| `PlayerController.cs` | Variables, Time.deltaTime, Rigidbody |
| `UIManager.cs` | Event subscription, casting, PlayerPrefs |

## Session order (2 hours)

1. Play the game (5 min)
2. Variables + SerializeField (10 min)
3. ScriptableObject (10 min)
4. Interface (10 min)
5. Events (15 min)
6. Collections — List (10 min)
7. Casting (10 min)
8. Enum (15 min)
9. Coroutine (15 min)
10. Singleton + Properties (10 min)
11. Challenge round (10 min)

Each numbered block has a matching web chapter:
https://uvinteractives.com/lab/unity — with checkpoints and challenges per concept.
See `CoinRush_InstructorGuide.html` for instructor talking points.

## Learning path

Coin Rush (this package) → **OOP Pillars / Screen Shift**:
https://github.com/uv-interactives/uvi-learn-oop-pillars — the four pillars of OOP,
built on these fundamentals.

## Requirements

- Unity 6000.0+
- Universal Render Pipeline (URP)
- TextMeshPro (included with Unity)
