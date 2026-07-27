# Claim-audit — Restoration Kernel (goal complete)

**Date:** 2026-07-27  
**HEAD intent:** ceiling close after comorbidity (#26–#29 + goal PR)

## Falsifiable goal

See `guides/restoration-kernel/GOAL.md`.

```
NOT done until: playtest:kernel 5/5, kernel unit suites green,
  e2e/kernel-void-save green, typecheck(+kernel), all PRODUCERS role-mapped.
```

## Verdict

**GOAL MET** on evidence below.

| Threshold | Evidence | Status |
|-----------|----------|--------|
| T1 100% producer→role map | `pipelineRoles.js` + `assertAllProducersMapped` + playtest sim | **PASS** |
| T2 productionMult on tick | `GameState.calculateTotalProduction` × mult; integration test | **PASS** |
| T3 offline fade sole path | `applyOfflineProgress` → `fadeOnGameState` only (no double worker apply) | **PASS** |
| T4 HUD counts ws_* | `projectPipelineHud(..., legacyWorkstations)` + badges on cards | **PASS** |
| T5 playtest n=5 | `npm run playtest:kernel` → 5/5 | **PASS** |
| T6 e2e void/save | `e2e/kernel-void-save.spec.js` passed | **PASS** |

## Live integration

| Path | Owner |
|------|--------|
| Cast resources | Kernel `castOnGameState` |
| Soft fade (tick + offline) | Kernel `fadeOnGameState` |
| Workstation craft graph | Legacy PRODUCERS (role-annotated) |
| Meditation mastery mult | Kernel → `specializationBonuses.productionMult` on cast **and** tick |
| Offline worker | Available API; load path single-fade main thread (no double-apply) |

## Commands

```bash
npm run playtest:kernel
npm run typecheck && npm run typecheck:kernel && npm run validate:kernel-content
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel*.test.js
npx playwright test e2e/kernel-void-save.spec.js
```

## Residuals (engineering must)

*(none for stated GOAL thresholds)*

## Explicit non-goals (honest)

- Full rewrite of craft economy onto only `PIPELINE_MODULES` (would rebalance midgame) — **roles unify UX without deleting PRODUCERS ladder**.
- Human mute-field pilot (growth ops).
- Production deploy canary.
