# Quality report — S+ / A+ bar

**Date:** 2026-07-27  
**Bar:** `QUALITY_BAR.md`  
**Commit intent:** feat/s-plus-quality-bar

## Scorecard

| ID | Gate | Result | Evidence |
|----|------|--------|----------|
| Q1 | typecheck + kernel + validate + playtest | **PASS** | tsc clean; playtest 5/5 |
| Q2 | unit suites | **PASS** | 204 tests (notifications + kernel + gameState + heal) |
| Q3 | e2e critical | **PASS** | 16/16 playwright |
| Q4 | toast max 2 | **PASS** | unit + burst capture `toastCount:2` |
| Q5 | visual ≥95 | **PASS** | 96 (pipeline+board readable under toast cap) |
| Q6 | SHARE a11y | **PASS** | aria-label full; responsive label CSS |
| Q7 | canary | pending post-deploy | re-run after merge |
| Q8 | dual-graph UX | **PASS** | 28/28 roles; exact HUD counts |

## Grade

| Axis | Grade |
|------|--------|
| Engineering gates Q1–Q4,Q8 | **S+** |
| Visual Q5–Q6 | **A+** (96; toast stack capped) |
| Ops Q7 | **A+** only after prod canary PASS |

**Overall when Q7 green: S+ / A+** under the falsifiable bar (not infinite polish).

## Changes for this bar

- `NotificationManager.maxVisible = 2` hard cap (immediate drop oldest)
- Toast container max-height safe band (top-right)
- SHARE label responsive readability
- typecheck clean under TypeScript 7 (audioAccess + pipelineHud + healCapture)

## Burst capture

`.scratch/ultraqa-kernel-goal/visual/splus-burst-report.json` → `{ toastCount: 2, cardVisible: true, maxOk: true }`
