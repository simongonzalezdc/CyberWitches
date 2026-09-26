# Claim audit — close-open-loops map

**Date:** 2026-07-27  
**Branch tip:** fix/close-open-loops (to merge)  
**Map:** `.scratch/close-open-loops/map.md`

| Ticket | Claim | Evidence |
|--------|--------|----------|
| 01 Color-debt | lint:color-debt PASS | `npm run lint:color-debt`; components.css token-only tier-0 |
| 02 Interval leaks | Debug-gated analytics intervals; dispose hooks | balanceAnalytics, analytics, economyBalancing, progressionAnalysis, memoryLeakFix, lazyLoader.loadAnalytics |
| 03 Onboarding owner | Orphans archived | `js/archive/tutorial.js`, `js/archive/onboarding.js`; lazyLoader → TutorialSystem |
| 04 Analytics theater | Prod load returns nulls | `loadAnalytics` requires debugAnalytics flag |
| 05 Lazy recovery | Player-visible failure | `reportLazyFailure` → SYSTEM_LOG + notification |
| 06/11 Producer copy | No empty descriptions | PRODUCERS all have description; unit test |
| 07 npm audit | Residual documented | High vulns remain in jest toolchain; `npm audit fix` non-breaking no clean fix; accepted residual |
| 08 Save store | ADR accepted | `docs/adr/0002-save-store-primary.md` |
| 09 CSP | First step | index.html dropped unsafe-eval; play residual documented |
| 10 Mid-arc goals | TutorialSystem | compile_goal_water + run_protocol |
| 12 Audio split | musicPolicy module | `js/audio/musicPolicy.js` wired |
| 13 gameState seam | castBonus pure | `js/game/castBonus.js` + GameState.cast |
| 14 Tier0 dramatize | CSS | EXEC outline + muted tabs under tier-0 |
| 15 Ship gate | this file + ci | tests/unit/closeOpenLoops.test.js |

## Residual accepted
- play.html still needs unsafe-eval for Tone
- npm high vulns in dev/jest chain without --force
- Full audioSystem/gameState splits remain multi-PR expand-contract after 12/13 first slices
