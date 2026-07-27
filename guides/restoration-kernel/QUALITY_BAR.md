# S+ / A+ quality bar (falsifiable)

**Date:** 2026-07-27  
**Overall bar lock:** **O2** — overall S+ requires **Eng ∩ Product ∩ Systems ∩ Identity**  
**Superlative request:** “everything S+”  
**Operationalization:** measurable gates only. No vibes. Tip-dated evidence required for any stamp.

## GOAL

```
GOAL: Stamp Hex Compiler overall S+ when Eng, Product, Systems, and Identity
  blocks all PASS on the same tip commit SHA.
NOT done until: QUALITY_REPORT.md lists tip SHA + all four blocks PASS.
```

**Hard rule:** While dual craft/production graphs remain live architecture, **Systems max A** and **overall S+ cannot be claimed**.

---

## Block A — Engineering (Q1–Q8)

| ID | Bar | Pass rule | Evidence |
|----|-----|-----------|----------|
| Q1 | CI truth | `typecheck`, `typecheck:kernel`, `validate:kernel-content`, `playtest:kernel` pass | log |
| Q2 | Unit | kernel* + gameState + heal critical + notification tests pass | jest |
| Q3 | E2E | kernel-void-save + smoke + heal-operator 100% pass | playwright |
| Q4 | Toast stack | max **2** visible toasts; third removes oldest; board readable under burst | unit + visual |
| Q5 | Visual | Visual score **≥ 95** on workstations+pipeline with forced toast burst **on tip** (not pre-aesthetic-v2) | VERDICT.json |
| Q6 | SHARE a11y | Full `aria-label` always; visible label readable ≥320px | e2e or visual |
| Q7 | Canary | prod `/` + `/play.html` HEALTHY, crash 0, `pipelineHud: true` | canary-report or deploy+probe |
| Q8 | Dual-graph UX | 28/28 producers role-mapped; HUD exact counts via ownership projection | playtest + unit |

**Eng S+** = Q1–Q8 all PASS on tip; no known crash residual.

---

## Block B — Product

| ID | Bar | Pass rule | Evidence |
|----|-----|-----------|----------|
| P1 | Store legible | Weighted storage used/cap visible on pipeline HUD (void-pressure units) | unit + visual/DOM |
| P2 | Void noticed | Overcap fade still applies; UI marks overcap / pressure without toast spam | unit + playtest |
| P3 | Prestige pacing | When band=`recommend`, player-facing interrupt/storylet can surface; playtest-kernel G5: ≥4/5 sessions have recommend before void unlock AB (400k) | playtest-kernel |
| P4 | Toast law | maxVisible=2 unchanged | unit |

**Product S+** = P1–P4 PASS.

---

## Block C — Systems

| ID | Bar | Pass rule | Evidence |
|----|-----|-----------|----------|
| S1 | Ownership projection | Single coalesce of ws_*/mod_* without double-count | unit |
| S2 | Production sole path | Live tick production uses coalesced ownership bag | unit + integration |
| S3 | Save single space | New saves write coalesced bag; legacy loads migrate | unit migrate |
| S4 | No dual counters | Role HUD counts match projection only | unit + playtest |

**Systems S+** = S1–S4 PASS (dual-graph not live architecture).  
If dual-graph remains: **Systems max A**, overall S+ blocked.

---

## Block D — Identity

| ID | Bar | Pass rule | Evidence |
|----|-----|-----------|----------|
| I1 | Visual tip | Q5 on tip ≥95; aesthetic-v2 + tier-0 mono preserved | VERDICT |
| I2 | Story CTA a11y | first-run story button WCAG AA contrast | e2e a11y-axe |
| I3 | Anti-cliché park | LEGACY_PARK forbids immortal banks + preservation-chamber spam | docs |
| I4 | Multi-surface chrome | pipeline HUD + story CTA use aesthetic-v2 rules without mono break | visual / CSS review |

**Identity S+** = I1–I4 PASS.

---

## Grade mapping

| Grade | Rule |
|-------|------|
| **Overall S+** | Eng S+ ∧ Product S+ ∧ Systems S+ ∧ Identity S+ on **one tip SHA** |
| **Eng S+** | Q1–Q8 all PASS |
| **A+** | Eng PASS; Product/Systems/Identity partial or dual-graph A-cap documented |
| **A** | Eng core green; product/systems incomplete |
| **B** | Core green, visual/canary incomplete |

## Stamp requirements (QUALITY_REPORT)

Any overall S+ claim must include:

1. **tip** git SHA  
2. date  
3. table of Eng/Product/Systems/Identity with PASS/FAIL  
4. commands run  

“100%” = overall S+ as defined above — not infinite polish.
