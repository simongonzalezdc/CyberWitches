# Overall S+ quality bar (falsifiable)

**Date:** 2026-07-27  
**Overall bar lock:** **O2** — overall S+ requires **Eng ∩ Product ∩ Systems ∩ Identity**  
**Shipped:** PR #58 on `main` (`0bc6c31`) — ownership coalesce, Store HUD, prestige band  
**Release:** package **v1.1.0** (GitHub Release tag `v1.1.0`)  
**Operationalization:** measurable gates only. No vibes. Tip-dated evidence required for any stamp.

## GOAL

```
GOAL: Stamp Hex Compiler overall S+ when Eng, Product, Systems, and Identity
  blocks all PASS on the same tip commit SHA.
NOT done until: QUALITY_REPORT.md lists tip SHA + all four blocks PASS.
```

**Systems rule:** Live craft ladder remains `PRODUCERS` (`ws_*`) for the buy list, but ownership is **coalesced** with Kernel `mod_*` pairs (`coalesceWorkstations` / `applyOwnershipDelta`). Production, role counts, and save/load use the coalesced bag. Dual-count is forbidden. Full content rewrite to one namespace-only is optional follow-up, not required for Systems S+.

---

## Block A — Engineering (Q1–Q8)

| ID | Bar | Pass rule | Evidence |
|----|-----|-----------|----------|
| Q1 | CI truth | `typecheck`, `typecheck:kernel`, `validate:kernel-content`, `playtest:kernel` pass | log |
| Q2 | Unit | kernel* + ownership-projection + gameState + heal + notification tests pass | jest |
| Q3 | E2E | kernel-void-save + smoke + heal-operator 100% pass | playwright |
| Q4 | Toast stack | max **2** visible toasts; third removes oldest; board readable under burst | unit + visual |
| Q5 | Visual | Visual score **≥ 95** on workstations+pipeline with toast burst on tip (aesthetic-v2) | VERDICT / structural tip artifact |
| Q6 | SHARE a11y | Full `aria-label` always; visible label readable ≥320px; story CTA AA | e2e or visual |
| Q7 | Canary | prod `/` + `/play.html` HEALTHY, crash 0, `pipelineHud: true` | canary / Deploy |
| Q8 | Roles + ownership | 28/28 producers role-mapped; HUD counts via coalesced ownership | playtest + unit |

**Eng S+** = Q1–Q8 all PASS on tip; no known crash residual.

---

## Block B — Product

| ID | Bar | Pass rule | Evidence |
|----|-----|-----------|----------|
| P1 | Store legible | Weighted storage used/cap visible on pipeline HUD | unit + DOM |
| P2 | Void noticed | Overcap fade applies; UI marks void pressure without toast spam | unit + playtest |
| P3 | Prestige pacing | ASCEND_BAND when recommend; playtest G5: recommend before void unlock AB (400k) | playtest-kernel |
| P4 | Toast law | maxVisible=2 unchanged | unit |

**Product S+** = P1–P4 PASS.

---

## Block C — Systems

| ID | Bar | Pass rule | Evidence |
|----|-----|-----------|----------|
| S1 | Ownership projection | `coalesceWorkstations` SUMs paired ws_*/mod_*; no dual-count | unit |
| S2 | Production sole path | Live tick uses coalesced bag + kernel-only module outputs | unit |
| S3 | Save single bag | Save/load coalesce; kernel craft writes canonical live id | unit + craft |
| S4 | HUD counts | Role counts match coalesced projection only | unit + playtest |

**Systems S+** = S1–S4 PASS.

---

## Block D — Identity

| ID | Bar | Pass rule | Evidence |
|----|-----|-----------|----------|
| I1 | Visual tip | Aesthetic-v2 hex lattice; tier-0 mono preserved; score ≥95 | VERDICT / CSS |
| I2 | Story CTA a11y | first-run story button WCAG AA contrast | e2e a11y-axe |
| I3 | Anti-cliché park | LEGACY_PARK forbids immortal banks + slop copy | docs |
| I4 | Multi-surface chrome | pipeline HUD + prestige interrupt styled under aesthetic-v2 | CSS / visual |

**Identity S+** = I1–I4 PASS.

---

## Grade mapping

| Grade | Rule |
|-------|------|
| **Overall S+** | Eng S+ ∧ Product S+ ∧ Systems S+ ∧ Identity S+ on **one tip SHA** |
| **Eng S+** | Q1–Q8 all PASS |
| **A+** | Eng PASS; optional polish nits only |
| **A** | Eng core green; product/systems incomplete |
| **B** | Core green, visual/canary incomplete |

## Stamp requirements (QUALITY_REPORT)

1. **tip** git SHA  
2. date  
3. table of Eng/Product/Systems/Identity with PASS/FAIL  
4. commands run

## Post-ship stamp

After a material merge that affects these gates, re-stamp `QUALITY_REPORT.md` (and `CLAIM_AUDIT.md`) to the new `origin/main` tip **before** calling the campaign done.

Procedure: [POST_SHIP_STAMP.md](POST_SHIP_STAMP.md) · `bash scripts/post-ship-stamp.sh`
