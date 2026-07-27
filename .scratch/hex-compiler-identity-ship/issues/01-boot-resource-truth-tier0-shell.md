# 01 — Boot resource truth + Tier 0 shell

**Status:** done

**What to build:** On a fresh boot, the resource monitor shows every elemental essence (not only Fire), both entrypoints declare the design-system version contract, and first paint is an honest Tier 0 shell — incomplete/broken terminal chrome that can heal later — rather than already-restored Kyanite polish. Counters and Tier 0 land together so new HUD nodes are not pretty-then-reworked.

**Blocked by:** None — can start immediately.

## Acceptance criteria

- [ ] After boot, counters exist for fire, water, air, crystal, aether (and focus if live, appropriately hidden until unlock).
- [ ] Both main entrypoints declare `data-design-system-version="kyanite-1"`.
- [ ] Fresh session first paint applies Tier 0 (body tier class / no full cyan-restored chrome until unlocks).
- [ ] Counter markup is tier-safe (not hardcoded fully-restored glow that fights Tier 0).
- [ ] Regression coverage asserts the boot HTML / counter contract.
- [ ] Lint/typecheck/tests relevant to this slice pass.

## Comments

- Implemented in session 2026-07-27; verified via sessionShipMust + full unit suite + lint/typecheck/build:prod.
