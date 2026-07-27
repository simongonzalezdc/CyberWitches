# 03 — Single onboarding owner (archive orphans)

**Status:** done  
**Type:** task  
**Blocked by:** None — can start immediately.

## What to build

ARCH-01: Keep **TutorialSystem** as sole first-run owner. Archive or delete dead `js/tutorial.js` and `js/onboarding.js` (or put behind explicit dead code path with zero imports from gameInit). Ensure no double boot/tutorial.

## Acceptance criteria

- [ ] gameInit / play boot does not import orphan onboarding stacks
- [ ] `js/tutorial.js` and `js/onboarding.js` removed or moved under archive with no live imports
- [ ] First-run still shows TutorialSystem + COMPILE_GOAL
- [ ] Grep for startTutorial / onboarding imports clean on prod path
- [ ] Tests pass
