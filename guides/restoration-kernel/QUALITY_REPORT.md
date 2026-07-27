# Quality report — overall S+ (O2)

**Date:** 2026-07-27  
**Bar:** `QUALITY_BAR.md` (Eng ∩ Product ∩ Systems ∩ Identity)  
**main tip:**  (includes docs refresh PR #59)
**package:** v1.1.0 · tag `v1.1.0`

## Overall

| Block | Grade | Result |
|-------|-------|--------|
| Engineering Q1–Q8 | Eng S+ | **PASS** |
| Product P1–P4 | Product S+ | **PASS** |
| Systems S1–S4 | Systems S+ | **PASS** (ownership coalesce sole path) |
| Identity I1–I4 | Identity S+ | **PASS** |
| **Overall** | **S+** | **PASS** on tip `0bc6c314aa4bd55b0f359d89db8767b689520114` |

## Eng Q1–Q8

| ID | Result | Evidence |
|----|--------|----------|
| Q1 | PASS | typecheck:kernel, validate:kernel-content, playtest-kernel (incl. G5) |
| Q2 | PASS | kernel*, ownership-projection, kernel-integration, sessionShipMust |
| Q3 | PASS | CI spine on main; kernel-void-save + smoke + heal-operator |
| Q4 | PASS | NotificationManager maxVisible=2 |
| Q5 | PASS | aesthetic-v2 live; structural VERDICT-TIP + toast law; story CTA AA (#38) |
| Q6 | PASS | SHARE a11y + story CTA contrast |
| Q7 | PASS | continuous Pages Deploy on main |
| Q8 | PASS | 28/28 roles; coalesce prevents dual-count |

## Product

| ID | Result | Evidence |
|----|--------|----------|
| P1 | PASS | pipeline HUD `STORAGE used/cap` weighted |
| P2 | PASS | `data-storage-pressure=overcap` + fade law |
| P3 | PASS | ASCEND_BAND interrupt + playtest G5 |
| P4 | PASS | toast max 2 |

## Systems

| ID | Result | Evidence |
|----|--------|----------|
| S1 | PASS | `coalesceWorkstations` SUM + `applyOwnershipDelta` |
| S2 | PASS | `calculateTotalProduction` coalesced bag + kernel-only modules |
| S3 | PASS | save/load coalesce; kernel craft → canonical `ws_*` |
| S4 | PASS | `countOwnedByRole` uses coalesce |

## Identity

| ID | Result | Evidence |
|----|--------|----------|
| I1 | PASS | css/aesthetic-v2.css; tier-0 mono |
| I2 | PASS | story CTA amber fill (#38) |
| I3 | PASS | LEGACY_PARK + anti-cliché copy |
| I4 | PASS | storage meta + prestige interrupt under aesthetic-v2 |

## Commands

```bash
npm run typecheck:kernel
npm run validate:kernel-content
npm run playtest:kernel
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel*.test.js tests/unit/ownership-projection.test.js tests/unit/sessionShipMust.test.js --runInBand
```
