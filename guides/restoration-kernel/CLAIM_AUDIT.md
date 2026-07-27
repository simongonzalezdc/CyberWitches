# Claim-audit — Restoration Kernel (current)

**Last updated:** 2026-07-27
**main tip:** `ffb0688` / `ffb068859c6371031b3c19da6a5755bdaf20a1d0`
**package / release:** **v1.1.0** (`v1.1.0` GitHub Release)  
**Deploy:** GitHub Pages on every `main` push

## Re-stamp after the next ship

Do not leave this file on an old tip. After any material merge to `main`, run the checklist in [POST_SHIP_STAMP.md](POST_SHIP_STAMP.md) (or `bash scripts/post-ship-stamp.sh`) **in the same session** and update **main tip** + **Last updated** below.

## Verdict

**SHIPPED on production and stamped overall S+ (O2)** under `QUALITY_BAR.md` / `QUALITY_REPORT.md`.

| Area | Status |
|------|--------|
| Pure Kernel domain (`js/kernel/`) | **DONE** |
| Live cast + soft fade sole paths | **DONE** — adapter |
| Weighted intermediate fade (`FADE_WEIGHT`) | **DONE** — PR #36 |
| Ownership coalesce (no dual-count) | **DONE** — PR #58 |
| Production + save use coalesced bag | **DONE** — PR #58 |
| Pipeline roles + HUD + badges | **DONE** — 28/28 producers |
| Store used/cap + void pressure HUD | **DONE** — PR #58 |
| Prestige ASCEND_BAND interrupt + playtest G5 | **DONE** — PR #58 |
| Offline fade + save kernel mirror | **DONE** |
| Toast maxVisible=2 | **DONE** |
| Aesthetic v2 hex lattice | **DONE** |
| Anti-cliché sector copy | **DONE** |
| Adversarial GD review | **DONE** — `ADVERSARIAL_GD_REVIEW.md` |
| Overall S+ four blocks | **PASS** — see `QUALITY_REPORT.md` |
| Semver release cut | **DONE** — v1.1.0 |

## Guides (this folder)

| File | Purpose |
|------|---------|
| MANUAL.md | Player-facing Kernel mechanics |
| SCHEMA.md | Commands / events / content / ownership |
| STORY_BIBLE.md | Chapters / qualities / voice |
| PLAYTEST_PROTOCOL.md | Human + automated playtest |
| GOAL.md | Ceiling-close goal (DONE) |
| QUALITY_BAR.md | Overall S+ O2 thresholds |
| QUALITY_REPORT.md | Tip-dated scorecard |
| ADVERSARIAL_GD_REVIEW.md | Hostile GD pass (historical + residuals) |
| LEGACY_PARK.md | What not to reintroduce |
| CLAIM_AUDIT.md | This file |

## Explicit residuals (not blockers for overall S+)

- **Human** mute-clip field pilot before paid UA (growth ops)
- Optional full content rewrite to single id namespace only (coalesce sole path already Systems S+)
- Migrate path may still emit `mod_*` for Kernel snapshots; live reads coalesce
- Optional dedicated multiplier-lift test (alias mults already implemented)
- Optional full pixel visual re-capture beyond structural VERDICT

## Release policy

| Question | Answer |
|----------|--------|
| How do players get updates? | Continuous **GitHub Pages** Deploy on `main` |
| Semver / GitHub Release? | **v1.1.0** cut for public handoff; bump only for intentional external releases |
| Save compatibility | Kernel snapshot version 2; coalesce on load; no forced wipe |

## Verify

```bash
npm run typecheck && npm run typecheck:kernel
npm run validate:kernel-content && npm run playtest:kernel
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel*.test.js tests/unit/ownership-projection.test.js tests/unit/sessionShipMust.test.js --runInBand
# prod: https://simongonzalezdc.github.io/CyberWitches/play.html
```
