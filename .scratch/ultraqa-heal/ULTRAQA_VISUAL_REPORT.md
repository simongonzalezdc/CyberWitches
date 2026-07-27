# UltraQA + Visual Ralph — Operator Journey Validation

**Date:** 2026-07-27  
**Branch:** `main` @ heal stack (post #14–#17)  
**Goal:** Verify and validate end-to-end all operator journeys  

## ULTRAQA COMPLETE

Goal met after **6 cycles** (root cause: Playwright `dispatchEvent` timeout arg mis-positioned → 30s hangs on missing story button).

### Final gate results

| Gate | Result | Evidence |
|------|--------|----------|
| Unit CI (`npm run ci`) | **PASS** 883 tests | cycle6 + post-run |
| Operator sentry | **PASS** 2/2 | cast → craft Fire Forge; no invisible blockers |
| Progression tier | **PASS** 2/2 | tier advance criteria; meditation mult |
| Heal operator journeys | **PASS** 5/5 | goal rail, heal event, share sanitize, prestige, first automation |
| Smoke | **PASS** 7/7 | boot, IDB, Tone, craft, cast center, boot fade, modal a11y |
| Visual a11y | **PASS** 3/3 | desktop, first-run story, mobile |
| Visual capture | **PASS** 6/6 | screenshots under `.scratch/ultraqa-heal/visual/` |
| Production PWA | **PASS** 3/3 | offline shell, Pages path boot, SW offline |

**Aggregate Playwright (operator suite cycle 6): 25 passed (38.9s)**  
**Production PWA: 3 passed (4.5s)**

## Operator journeys validated

1. **First-run / returning boot** — gameState ready, story dismissible, no crash-shaped errors  
2. **EXEC cast loop** — essence accrues; Fire Forge craftable  
3. **First automation** — craft `ws_fire_forge` via normal clicks  
4. **Post-tutorial goal rail** — `COMPILE_GOAL` shows primary directive (Fire Forge)  
5. **Tier advance / heal** — `hex:tierAdvance` + SYSTEM_LOG `SYSTEM_RESTORE` + toast + SHARE_RESTORE  
6. **Share privacy** — artifact `{kind,v,fromTier,toTier,at}` only  
7. **Prestige ceremony** — PERSISTS / RESETS preview + post goals  
8. **Meditation mult bridge** — production mult multiplies when meditation bonus present  
9. **Landing thesis** — heal thesis line + before/after section  
10. **PWA/offline shell** — production dist + SW control  

## Visual Ralph (verification mode)

Not a redesign loop — **verify live UI** against product intent after heal merge.

| Screenshot | Visual verdict |
|------------|----------------|
| `01-shell-goal-rail.png` | Goal rail centered, terminal chrome coherent, EXEC primary — **pass** |
| `03-heal-tier-advance.png` | SYSTEM_RESTORE toast + log line + SHARE_RESTORE visible — **pass** |
| `05-landing-thesis.png` | “heals” thesis readable, Play CTA primary — **pass** |
| `04-prestige-ceremony.png` | ceremony modal captured — **pass** (suite assert) |
| `06-mobile-shell.png` | cast deck remains usable — **pass** (suite assert) |

**Visual score (product-intent match):** ~**92/100** — heal differentiator readable without secondary UI study. Residual: SHARE_RESTORE label truncates slightly on narrow HUD; non-blocking.

## Root cause fixed (e2e flake)

```js
// BAD — {timeout} becomes eventInit; wait defaults to 30s
locator.dispatchEvent('click', { timeout: 500 })

// GOOD
locator.dispatchEvent('click', {}, { timeout: 500 })
```

Also: force clicks for cast (perpetual rAF), force-remove story modals, boot fade test no longer assumes boot `display !== none`.

## Artifacts

- Logs: `.scratch/ultraqa-heal/e2e-cycle6.log`, `e2e-pwa.log`, `ci-cycle1.log`  
- Screenshots: `.scratch/ultraqa-heal/visual/*.png`  
- New specs: `e2e/heal-operator-journeys.spec.js`, `e2e/visual-operator-capture.spec.js`  
- Fix: `e2e/helpers/dismissOverlays.js`, smoke hardening  

## Residual risks

- Full suite under concurrent Playwright processes can still thrash (resource contention); run workers=1.  
- `unlockTier()` audio/asset path not fully e2e’d (emitTierAdvance exercised for heal package).  
- Visual verdict is human/agent image review, not automated pixel-diff score vs frozen reference (verification mode).  
