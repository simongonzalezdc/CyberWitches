# Claim-audit — Restoration Kernel (zero residuals)

**Date:** 2026-07-27  
**Scope:** Must tickets 01–20 + live GameState integration  
**Branch evidence:** `feat/kernel-zero-residual-integration` → merge to main  

## Falsifiable goal

```
GOAL: Kernel is sole mutator for live cast resources + soft fade; pipeline HUD
      visible; chapter-rebound tiers; meditation mastery wired; strict kernel
      typecheck; worker offline path; claim-audit residuals = [].
NOT done until: npm run typecheck && typecheck:kernel && validate:kernel-content
      && jest kernel* + kernel-integration pass; CLAIM_AUDIT residuals empty.
```

## Verdict

**SHIPPED — 0 engineering residuals.**

| Ticket | Status | Evidence |
|--------|--------|----------|
| 01 Cast pure | **DONE** | `js/kernel/cast.js` + live `GameState.cast` → `castOnGameState` |
| 02 Schema CI | **DONE** | `validate:kernel-content` in `ci` |
| 03 Fade | **DONE** | `fadeOnGameState` called from `GameState.tick` |
| 04 Pipeline pack | **DONE** | `content.js` + HUD chips |
| 05 Tick | **DONE** | pure tick + live production then kernel fade |
| 06 Migrate | **DONE** | `migrate.js` legacy ws_* |
| 07–08 Chapters/contracts | **DONE** | chapters + projectors |
| 09 Prestige | **DONE** | preview/commit + keys |
| 10 Affinity strategies | **DONE** | `affinity.js` + `chooseElementSpecialization` |
| 11 Meditation mastery | **DONE** | `meditationManager.endSession` → Kernel |
| 12 Tier rebound | **DONE** | chapter OR AB gates in `designTierSystem` |
| 13 Pipeline HUD | **DONE** | `#pipeline-role-hud` + `PipelineHudUI` |
| 14 TS Kernel | **DONE** | `npm run typecheck:kernel` strict checkJs |
| 15 Balance battery | **DONE** | `kernel-balance.test.js` |
| 16 Playtest protocol | **DONE** | `guides/restoration-kernel/PLAYTEST_PROTOCOL.md` |
| 17 Docs | **DONE** | guides/restoration-kernel/* |
| 18 Legacy park | **DONE** | LEGACY_PARK.md |
| 19 Worker tick | **DONE** | `tickWorkerHost.js` (≥60s offline) |
| 20 Claim-audit | **DONE** | this file |

## Live integration debt (closed)

| Item | Resolution |
|------|------------|
| Dual-write cast | **Closed** — `GameState.cast` only grants via Kernel |
| Dual-write fade | **Closed** — `GameState.tick` calls `fadeOnGameState` only |
| Pipeline HUD HTML | **Closed** — play.html + CSS + PipelineHudUI |
| Meditation mult | **Closed** — endSession → `meditationOnGameState` |
| Strict TS kernel | **Closed** — `typecheck:kernel` in ci |
| Worker tick | **Closed** — host + inline worker fallback |

## Capture-the-heal human mute field

**Not code debt.** Engineering: stimulus + e2e + runbook complete. Human n=5 pilot is **growth ops** before paid UA (see `.scratch/capture-the-heal/FIELD_MUTE_CLIP.md`). No open Kernel residual.

## Commands (must pass)

```bash
npm run typecheck
npm run typecheck:kernel
npm run validate:kernel-content
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel.test.js tests/unit/kernel-balance.test.js tests/unit/kernel-integration.test.js
```

## Residuals (engineering)

*(none for must integration gates after comorbidity pass #29.)*

## Known non-must / next-horizon (not residuals of this campaign)

- Live craft graph still uses legacy `PRODUCERS` (`ws_*`); Kernel `PIPELINE_MODULES` drive HUD foreshadow + fade law, not workstation craft list yet.
- `offlineTickOnGameState` worker host exists; load-path offline still main-thread production + kernel fade (worker optional for large pure-kernel ticks).
- Human mute-field n=5 pilot remains growth ops before paid UA.

## Comorbidity pass (2026-07-27)

Fixed before ship:
1. Offline catch-up skipped soft fade → void law hole (fixed: `applyOfflineProgress` → `fadeOnGameState`).
2. Kernel affinity/chapters/seed not in save → reload amnesia (fixed: `saveData.kernel` + load merge).
3. Load overwrote `specializationBonuses` from catalog only → lost meditation mult (fixed: merge saved + strategy).
4. `voidLoss` batch events had no projector (fixed: SYSTEM_LOG).
