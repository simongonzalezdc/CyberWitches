# Claim-audit — Capture the heal

**Date:** 2026-07-27  
**Map:** `.scratch/capture-the-heal/map.md`  
**Merged:** Forgejo PR **#20** → `main` (`8aa1847`)  
**Auditor:** implement + docs closeout session  

## Verdict

| Scope | Status |
|-------|--------|
| Must code **01–06, 12** | **DONE — on main** |
| Must growth **10** field n=5 | **RESIDUAL (HITL)** |
| Must growth **11** pivot clock | **ARMED** — engineering start 2026-07-27, end 2026-08-26, N=50 |
| Should **07–09** | **DONE on main** |
| Player/agent docs refresh | **DONE** (README, CONTEXT, GAME_MANUAL, USER_GUIDE, PRIVACY, CHANGELOG, PRODUCT_STRATEGY, architecture, API, llms.txt) |

---

## Ticket evidence

| # | Claim | Evidence | Residual |
|---|--------|----------|----------|
| 01 | Mute-clip stimulus frozen | `MUTE_CLIP_RUNBOOK.md`; linked from research closeout | Field sample separate |
| 02 | TTA/TTH/share funnel local | `funnelMetrics.js` on main | Live p50 not measured |
| 03 | Still-first format | `FORMAT_DECISION.md` | Loop deferred |
| 04 | Ceremony SM + reduced-motion | `healCeremony.js` on main | — |
| 05 | Split capture sanitized | `healCapture.js` on main | — |
| 06 | SHARE_RESTORE ≤2 actions | `healShare.js` on main | Clipboard env-dependent |
| 07 | Landing/OG heal still | `screenshots/heal-split-still.png` | Confirm live after GH Pages sync |
| 08 | Creator seed | `CREATOR_SEED.md` | — |
| 09 | Community checklist | `COMMUNITY_POST_CHECKLIST.md` | — |
| 10 | Field mute-clip n=5 | Protocol ready | **0/5 run** — growth spend blocked |
| 11 | Pivot rebaseline | `PIVOT_REBASELINE.md` filled | Operator re-confirm on deploy |
| 12 | This audit | This file | — |

---

## Kill-list check

No third currency, gacha, dual quest HUD, CSS framework swap, GameState rewrite, Steam-before-D1.

## GLM review (PR #20)

Addressed in `9ec0712` before merge: reduced-motion no pulse, honest download success, live beats, session-scoped funnel, sanitize word boundaries.

## Honest residuals

1. **Field mute-clip n=5** not executed (human subjects).  
2. **GitHub / GH Pages** may lag Forgejo until mirror sync.  
3. **jsdom** lacks real canvas — paint unit-tested with mocks; browser e2e green.

## Verification commands

```bash
npm run ci
npx playwright test e2e/heal-operator-journeys.spec.js e2e/visual-operator-capture.spec.js
```
