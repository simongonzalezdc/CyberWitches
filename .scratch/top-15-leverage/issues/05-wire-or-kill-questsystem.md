# 05 — Wire or kill questSystem

**What to build:** Resolve the half-present quest singleton: either wire it end-to-end (boot, progress hooks, player-visible objectives) or archive it completely so it cannot dual-own first-run guidance.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Explicit decision recorded: wire vs archive (default if unspecified: archive unless a live UI already depends on it E2E)
- [x] No half-singleton on the prod path afterward
- [x] TutorialSystem remains sole first-run owner if quests are archived
- [x] CI green
