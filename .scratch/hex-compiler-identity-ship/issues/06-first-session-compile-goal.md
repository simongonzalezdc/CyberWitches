# 06 — First-session compile goal (TutorialSystem)

**Status:** done

**What to build:** New players get one short first-session compile goal through TutorialSystem only: stabilize the Fire sector by crafting one Fire Forge. No new onboarding module, no dailies-as-primary for this goal, no wiring of orphan legacy onboarding/tutorial stacks.

**Blocked by:** 01 — Boot resource truth + Tier 0 shell

## Acceptance criteria

- [ ] First-run path surfaces: `COMPILE_GOAL: Stabilize Fire sector — craft 1 Fire Forge.`
- [ ] Owner is TutorialSystem only.
- [ ] Orphan onboarding/tutorial stacks are not reactivated for this goal.
- [ ] Goal is visible without requiring prestige or dailies tab as primary.
- [ ] Coverage asserts TutorialSystem owns the locked copy.
- [ ] Relevant tests pass.

## Comments

- Implemented in session 2026-07-27; verified via sessionShipMust + full unit suite + lint/typecheck/build:prod.
