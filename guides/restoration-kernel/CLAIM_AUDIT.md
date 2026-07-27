# Claim-audit — Restoration Kernel (current)

**Last updated:** 2026-07-27  
**main tip:** post-PR #36 (adversarial GD + weighted fade + aesthetic v2)  
**Deploy:** GitHub Pages Deploy workflow green on `e8146fd` merge

## Verdict

**SHIPPED on production.** Pure Kernel + live cast/fade adapter + pipeline HUD + weighted intermediate fade + hex lattice aesthetic + S+/A+ quality bar (Q1–Q8). Continuous Pages deploy — **no separate semver release required** for players.

| Area | Status |
|------|--------|
| Pure Kernel tickets 01–20 (domain) | **DONE** — `js/kernel/` |
| Live cast + soft fade sole paths | **DONE** — adapter |
| **Weighted intermediate fade** (`FADE_WEIGHT` full ladder) | **DONE** — PR #36 |
| Pipeline roles + HUD + badges | **DONE** — 28/28 producers |
| Offline fade + save kernel mirror | **DONE** |
| Toast maxVisible=2 | **DONE** |
| Aesthetic v2 hex lattice | **DONE** — `css/aesthetic-v2.css` in prod main.css |
| Anti-cliché sector copy | **DONE** — producers + pipeline modules |
| Adversarial GD review doc | **DONE** — `ADVERSARIAL_GD_REVIEW.md` |
| CI / playtest / e2e | **DONE** (sessionShipMust cast path retargeted to Kernel) |
| Production canary | **HEALTHY** post-#36 deploy |
| Quality bar Q1–Q8 | **PASS** — see `QUALITY_REPORT.md` |

## Guides (this folder)

| File | Purpose |
|------|---------|
| MANUAL.md | Player-facing Kernel mechanics (incl. weighted fade) |
| SCHEMA.md | Commands / events / content shape + FADE_WEIGHT note |
| STORY_BIBLE.md | Chapters / qualities |
| PLAYTEST_PROTOCOL.md | Human + automated playtest |
| GOAL.md | Ceiling-close falsifiable goal (DONE) |
| QUALITY_BAR.md | S+/A+ measurable thresholds |
| QUALITY_REPORT.md | Latest scorecard |
| ADVERSARIAL_GD_REVIEW.md | Hostile GD: scaling, difficulty, anti-cliché |
| LEGACY_PARK.md | What not to reintroduce |
| CLAIM_AUDIT.md | This file |

## Explicit non-engineering residuals

- **Human** mute-clip field pilot before paid UA (growth ops) — stimulus/engineering already under Capture the heal.
- Full rewrite of craft economy onto **only** `PIPELINE_MODULES` (would rebalance midgame) — **roles unify UX** while `PRODUCERS` remain the live buy list.
- Prestige timing vs void unlocks (F3 in adversarial review) — playtest optional storylet.
- Generator display-name template rename (F6) — achievement surface risk; park.

## Release policy (current)

| Question | Answer |
|----------|--------|
| Need a new npm/semver release for this ship? | **No.** `package.json` stays at `1.0.0`. Players get updates via **GitHub Pages** Deploy on every `main` push. |
| When to cut a GitHub Release / tag? | Optional marketing / external handoff only — not required for live play. |
| Save compatibility | Kernel snapshot `version: 2` unchanged; fade weights are pure runtime law (no migration). |

## Verify

```bash
npm run typecheck && npm run typecheck:kernel
npm run validate:kernel-content && npm run playtest:kernel
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel*.test.js tests/unit/notifications.test.js tests/unit/sessionShipMust.test.js
npx playwright test e2e/kernel-void-save.spec.js e2e/smoke.spec.js
# prod: https://simongonzalezdc.github.io/CyberWitches/play.html
# aesthetic inlined: dist css/main.css contains aesthetic-v2 markers
```
