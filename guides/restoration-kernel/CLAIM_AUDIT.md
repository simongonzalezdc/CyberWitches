# Claim-audit — Restoration Kernel (current)

**Last updated:** 2026-07-27  
**main tip (docs stamp):** post-PR #34 quality stamp; Kernel live on Pages  

## Verdict

**SHIPPED on production.** Pure Kernel + live cast/fade adapter + pipeline HUD + S+/A+ quality bar (Q1–Q8).

| Area | Status |
|------|--------|
| Pure Kernel tickets 01–20 (domain) | **DONE** — `js/kernel/` |
| Live cast + soft fade sole paths | **DONE** — adapter |
| Pipeline roles + HUD + badges | **DONE** — 28/28 producers |
| Offline fade + save kernel mirror | **DONE** |
| Toast maxVisible=2 | **DONE** |
| CI / playtest / e2e | **DONE** |
| Production canary | **HEALTHY** + `pipelineHud: true` |
| Quality bar Q1–Q8 | **PASS** — see `QUALITY_REPORT.md` |

## Guides (this folder)

| File | Purpose |
|------|---------|
| MANUAL.md | Player-facing Kernel mechanics |
| SCHEMA.md | Commands / events / content shape |
| STORY_BIBLE.md | Chapters / qualities |
| PLAYTEST_PROTOCOL.md | Human + automated playtest |
| GOAL.md | Ceiling-close falsifiable goal |
| QUALITY_BAR.md | S+/A+ measurable thresholds |
| QUALITY_REPORT.md | Latest scorecard |
| LEGACY_PARK.md | What not to reintroduce |
| CLAIM_AUDIT.md | This file |

## Explicit non-engineering residuals

- **Human** mute-clip field pilot before paid UA (growth ops) — stimulus/engineering already under Capture the heal.
- Full rewrite of craft economy onto **only** `PIPELINE_MODULES` (would rebalance midgame) — **roles unify UX** while `PRODUCERS` remain the live buy list.

## Verify

```bash
npm run typecheck && npm run typecheck:kernel
npm run validate:kernel-content && npm run playtest:kernel
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel*.test.js tests/unit/notifications.test.js
npx playwright test e2e/kernel-void-save.spec.js e2e/smoke.spec.js
# prod: https://simongonzalezdc.github.io/CyberWitches/play.html
```
