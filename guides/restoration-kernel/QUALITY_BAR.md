# S+ / A+ quality bar (falsifiable)

**Date:** 2026-07-27  
**Superlative request:** “100%+ S+ A+”  
**Operationalization:** measurable gates only. No vibes.

## GOAL

```
GOAL: Ship CyberWitches Kernel surface at S+ engineering + A+ visual/ops bars such that
  every threshold below PASSES, proven by commands + artifact paths listed.
NOT done until: QUALITY_REPORT.md shows all PASS and production canary HEALTHY
  with pipelineHud true.
```

## Thresholds

| ID | Bar | Pass rule | Evidence |
|----|-----|-----------|----------|
| Q1 | CI truth | `typecheck`, `typecheck:kernel`, `validate:kernel-content`, `playtest:kernel` pass | log |
| Q2 | Unit | kernel* + gameState + heal critical + notification tests pass | jest |
| Q3 | E2E | kernel-void-save + smoke + heal-operator 100% pass | playwright |
| Q4 | Toast stack | max **2** visible toasts; third removes oldest; board cards not fully covered in visual capture | unit + visual |
| Q5 | Visual | Visual score **≥ 95** on workstations+pipeline with forced toast burst | VERDICT.json |
| Q6 | SHARE a11y | Full `aria-label` always; visible label readable ≥320px | e2e or visual |
| Q7 | Canary | prod `/` + `/play.html` HEALTHY, crash 0, `pipelineHud: true` | canary-report |
| Q8 | Dual-graph UX | 28/28 producers role-mapped; HUD exact counts | playtest + unit |

## Grade mapping

| Grade | Rule |
|-------|------|
| **S+** | Q1–Q8 all PASS; no known crash residual |
| **A+** | Q1–Q8 PASS; optional polish nits only (documented) |
| **A** | Q1–Q3,Q7,Q8 PASS; Q4–Q6 partial |
| **B** | Core green, visual/canary incomplete |

“100%” = **all Q1–Q8 PASS**, not infinite polish.
