# Phase 4 retrofit — what changed and how to apply

## Files here
- `coin-rush-README.md`  → replaces `README.md` in uvi-learn-coin-rush
- `oop-pillars-README.md` → replaces `README.md` in uvi-learn-oop-pillars

## What changed (both)
1. **Chapter 0 — From Scratch**: complete empty-project→playing path, every manual
   step numbered, checkpoint list. This is the zero-prerequisite guarantee.
2. **Web tutorial links** both ways (the site matches `packageRepo` frontmatter to
   the repo URL — links must stay exact).
3. **Learning path**: Coin Rush → OOP Pillars, cross-linked.
4. **oop-pillars placeholder bug FIXED**: install URL was
   `https://github.com/[your-org]/screenshift-unity-package.git` (404 for every
   student). Now the real URL, pinned to `#1.0.0`.
5. Install via **git URL pinned to tag** promoted to the primary path (both repos
   have `1.0.0` tags and committed .meta files, so it works).

## To apply (per repo)
```
copy the file over README.md in the repo working copy
git add README.md
git commit -m "docs: Chapter 0 from-scratch section + web tutorial links (phase 4)"
git push
```
No re-tag needed — README-only change; students on #1.0.0 see the GitHub page version.

## Suggested (optional) repo follow-ups
- coin-rush: menu items are labelled "2. Create Default ScriptableObjects" and
  "1. Build Scene" but must run SO-first — the numbers mislead. Consider renaming
  to "Step 1 → Create Default ScriptableObjects" / "Step 2 → Build Scene" like
  oop-pillars (script-only change, worth a 1.0.1 tag).
- Delete this phase4-retrofit/ folder from the website repo after applying.
