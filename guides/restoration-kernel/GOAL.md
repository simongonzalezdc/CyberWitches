# Falsifiable goal — Kernel ceiling close

**Date:** 2026-07-27  
**Status:** DONE (local evidence; land via goal PR → main)

## GOAL

```
GOAL: Close comorbidity ceiling gaps so that
  (1) all live PRODUCERS map to pipeline roles (100% coverage),
  (2) meditation productionMult multiplies tick production,
  (3) offline fade remains sole void path (no double-apply),
  (4) HUD counts legacy ws_* into Capture→Store→Bind→Compile→Shield,
  (5) automated playtest sim n=5 passes G1–G4 proxies,
  (6) e2e kernel-void-save green,
proven by: scripts/playtest-kernel-sim.js exit 0,
  jest kernel* + kernel-integration,
  playwright e2e/kernel-void-save.spec.js,
  guides/restoration-kernel/CLAIM_AUDIT.md residual section.
NOT done until: all of the above pass on CI/local.
```

## Thresholds

| # | Check | Pass |
|---|--------|------|
| T1 | `assertAllProducersMapped(PRODUCERS)` | missing = [] |
| T2 | tick with productionMult=1.1 > mult=1.0 output | true |
| T3 | offline overcap reduces inventory | true |
| T4 | HUD ownedTotal credits ws_fire_forge as capture | ≥1 |
| T5 | playtest sim | 5/5 |
| T6 | e2e kernel-void-save | pass |

## Commands

```bash
node scripts/playtest-kernel-sim.js
npm run typecheck && npm run typecheck:kernel && npm run validate:kernel-content
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel*.test.js
npx playwright test e2e/kernel-void-save.spec.js
```
