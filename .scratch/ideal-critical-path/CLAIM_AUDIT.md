# Claim-audit — ideal-critical-path (ticket 16)

**Base:** code on branch(es) implementing heal critical path.  
**CI truth:** Forgejo `npm run ci` + required Playwright smoke/progression (no `|| true`).

| Ticket | Claim | Evidence | Status |
|--------|-------|----------|--------|
| 01 e2e CI required | Forgejo CI runs real lint/typecheck/unit + smoke/progression e2e | `.forgejo/workflows/ci.yml`; `healW0Foundation.test.js` asserts no `npm test \|\| true` | CLAIMED |
| 02 mult-cache | Volatile buffs/meditation applied after stable cache | `js/gameState.js` `_applyVolatileProductionMult`; unit test | CLAIMED |
| 03 dist smoke | smoke:dist script | `scripts/smoke-dist.sh`, package.json scripts | CLAIMED |
| 04 unlock ratio | max consecutive unlock ratio &lt; 5 | `healW0Foundation.test.js` + PRODUCERS | CLAIMED |
| 05 goal stack | Primary goal after tutorial | `compileGoalStack.js`, `compileGoalUI.js`, `#compile-goal-rail`, unit | CLAIMED |
| 06 tier-advance event | `hex:tierAdvance` CustomEvent | `designTierSystem.emitTierAdvance` | CLAIMED |
| 07 funnel telemetry | local counters tier/share | `cw.funnel.tierAdvance`, `cw.funnel.shareAttempt` | CLAIMED (local-only) |
| 08 heal moment | visual + SYSTEM_LOG + stinger path + reduced-motion | `playHealMoment`, CSS `tier-advance-heal` | CLAIMED |
| 09 session pacing | first automation low cost; target documented | Fire Forge 10 essence; unit 09 | CLAIMED (measurement method: unit + fresh play) |
| 10 meditation Δ | live mult before/after | `meditationState.endSession` MEDITATION_Δ | CLAIMED |
| 11 save outcome UX | parse/migration/invalid/checksum → player + log | `gameState.loadGameState` SAVE_OUTCOME lines | CLAIMED |
| 12 share capture | sanitized artifact | `healShare.js` buildHealShareArtifact | CLAIMED |
| 13 landing thesis | thesis + before/after + Play CTA | `index.html` hero-thesis, heal-before-after | CLAIMED |
| 14 prestige ceremony | persist/reset preview + post goals | play.html prestige-preview | CLAIMED |
| 15 growth ops | seed + clip path + pivot N | `GROWTH_OPS.md` | CLAIMED (ops docs) |
| 16 claim-audit | this file | CLAIM_AUDIT.md | CLAIMED |

## Residuals (Should / incomplete honesty)

- Live 15s GIF not committed as media asset (placeholder before/after on landing).
- Share funnel is localStorage-only; no server analytics.
- First-session p50 wall-clock not instrumented in CI (cost proxy only).
- Prestige post-goal wiring relies on compile goal stack after prestigeCount increments (runtime path exists; no dedicated e2e for full prestige ceremony yet).
- GLM review per PR is process evidence; attach `GLM_REVIEW_PR*.md` when reviews land.

## CI gate

```bash
npm run ci
# optional: npm run test:e2e:critical
# optional: npm run smoke:src
```
