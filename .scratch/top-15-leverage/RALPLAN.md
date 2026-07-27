# RALPLAN — Top 15 leverage campaign

**Status:** pending approval  
**Mode:** consensus (Planner → Architect steelman → Critic)  
**Date:** 2026-07-27  
**Map:** `.scratch/top-15-leverage/map.md`

## RALPLAN-DR summary

### Principles
1. **Protect progression truth** — silent zeros and dead wires are P0 over polish.
2. **Evidence over claims** — e2e/smoke + claim-audit before map done.
3. **Expand–contract only** for god objects; no mega-rewrite.
4. **Prefer delete/archive** of half-systems over dual onboarding.
5. **Forgejo is SoT** — docs and process match protected-main reality.

### Decision drivers (top 3)
1. Regression risk on design tier / meditation (already bitten once).
2. Player-visible mid/late void (25× unlock gap).
3. Agent/human footguns (backup twin, wrong remote, half-wired quests).

### Viable options
| Option | Summary | Pros | Cons |
|--------|---------|------|------|
| **A — Ordered 15 map (chosen)** | Ship leverage-ranked tickets Must/Should | Clear order; matches audit | 15 tickets need discipline |
| **B — Only e2e+hygiene (01–03,10,15)** | Skip economy/architecture | Fast green | Leaves pacing and god-objects |
| **C — Architecture-first (08–09 only)** | Deepen seams | Long-term velocity | Leaves player voids open |

**Invalidation of B/C:** B fails destination (economy + half-wired systems remain). C fails driver 1–2 (player trust).

### Chosen approach
Execute **Option A** via map tickets. Default HITL decisions without operator:
- Ticket 04 → **kill/archive** questSystem unless live UI already depends on it E2E.
- Ticket 06 → **A (explicit gate copy)** unless e2e shows long stuck Tier 0 with AB and no achievements, then hybrid.

### Recommended ship waves
1. **Wave H (hygiene+guards):** 03, 01, 02, 11  
2. **Wave P (product feel):** 04, 05, 06, 07, 13  
3. **Wave O (ops+arch):** 10, 08, 09, 12, 14  
4. **Wave G (gate):** 15 claim-audit  

### Seams (for /to-spec)
- **S1 Design tier unlock** — `DesignTierSystem.checkTierUnlocks` + body class / unlocked set (highest behavior seam).
- **S2 Production mult** — `GameState.getProductionMultiplier` including meditation bridge.
- **S3 Producer unlock graph** — PRODUCERS data + integrity test (already partially exists).
- **S4 Potion display/effect** — recipe outputs ↔ display name ↔ getPotionEffect.
- Prefer existing Playwright e2e + unit progressionWiring; avoid new frameworks.

### Architect steelman (antithesis)
“Ship only e2e for tier+meditation and stop—everything else is polish.”  
**Synthesis:** e2e is necessary but not sufficient; 25× gap and half-wired systems still create “broken product” feel. Architecture slices stay **Should**, not Must blockers for destination minimum.

### Critic verdict: **APPROVE** (with conditions)
- Must not re-open identity locks.
- Ticket 15 required before claiming map complete.
- Plan remains **pending approval** for execution; no implement until user says `/implement` or approve.

### ADR
- **Decision:** Pursue top-15 leverage map Option A with waves H→P→O→G.  
- **Drivers:** progression regression, economy void, agent footguns.  
- **Alternatives:** B hygiene-only; C architecture-only.  
- **Why A:** balances falsifiable player outcomes with durable seams.  
- **Consequences:** multi-ticket campaign; needs claim-audit honesty on residual Should.  
- **Follow-ups:** further audio/gameState slices graduate after 08/09.

## Pending approval

Await explicit execution approval before `/implement all` or PR opens.
