# Claim-audit — Capture the heal

**Date:** 2026-07-27  
**Map:** `.scratch/capture-the-heal/map.md`  
**Branch:** `feat/capture-the-heal`  
**Auditor:** implement session  

## Verdict

| Scope | Status |
|-------|--------|
| Must code **01–06, 12** (docs for 01/03; eng for 02–06) | **DONE with evidence** |
| Must growth **10** field n=5 | **RESIDUAL (HITL)** |
| Must growth **11** pivot clock | **DOC READY** — start date fills on main/deploy |
| Should **07–09** | **DONE** (OG still, creator seed, community checklist) |

---

## Ticket evidence

| # | Claim | Evidence | Residual |
|---|--------|----------|----------|
| 01 | Mute-clip stimulus frozen | `MUTE_CLIP_RUNBOOK.md`; linked from `RESEARCH_GAP_CLOSEOUT.md` §1 | Field sample separate |
| 02 | TTA/TTH/share funnel local | `js/modules/game/funnelMetrics.js`; craft + emitTierAdvance + share hooks; `tests/unit/captureTheHeal.test.js` | Live p50 not measured |
| 03 | Still-first format | `FORMAT_DECISION.md` + issue 03 checked | Loop deferred |
| 04 | Ceremony SM + reduced-motion | `healCeremony.js` + CSS beats; designTier `playHealMoment` | — |
| 05 | Split capture sanitized | `healCapture.js`; unit privacy tests; e2e funnel+capture journey | Pixel variance browser-dependent |
| 06 | SHARE_RESTORE ≤2 actions | `healShare.captureHealShare` downloads PNG + copies text; gameInit notify | Clipboard perms env-dependent |
| 07 | Landing/OG heal still | `screenshots/heal-split-still.png`; index OG + hero section img | Deploy needed for live OG |
| 08 | Creator seed | `CREATOR_SEED.md` (console/dev, not public skip) | — |
| 09 | Community checklist | `COMMUNITY_POST_CHECKLIST.md` | — |
| 10 | Field mute-clip n=5 | Protocol ready | **0/5 run** — growth spend blocked |
| 11 | Pivot rebaseline | `PIVOT_REBASELINE.md` N=50 | Start date after main/deploy |
| 12 | This audit | This file | — |

---

## Kill-list check

No third currency, gacha, dual quest HUD, CSS framework swap, GameState rewrite, Steam-before-D1.

## GLM review (PR #20)

Initial `REQUEST CHANGES` addressed in `9ec0712`:

- Reduced-motion share reveal without pulse class  
- `visual.ok` only when download trigger succeeds  
- Live ceremony `beats` array returned  
- Session-scoped `sessionStart` for TTA/TTH clocks  
- Sanitize check no longer matches short `ab` substrings  

## Honest residuals

1. **Field mute-clip n=5** not executed (human subjects).  
2. **Pivot clock** starts only after production deploy of visual share.  
3. **jsdom has no real canvas** — paint path unit-tested with mock ctx; real PNG proven in browser + sharp OG asset.

## Verification commands

```bash
npm run ci
npm run test:e2e:critical
npx playwright test e2e/heal-operator-journeys.spec.js e2e/visual-operator-capture.spec.js
```
