# RALPLAN — Capture the heal

**Status:** approved · **shipped** (PR #20 → main 2026-07-27)  
**Mode:** consensus · **deliberate** (product/viral campaign risk)  
**Date:** 2026-07-27  
**Map:** `.scratch/capture-the-heal/map.md`  
**Context:** `.omx/context/capture-the-heal-20260727T074127Z.md`  
**Research:** `.scratch/ideal-critical-path/RESEARCH_GAP_CLOSEOUT.md`

---

## RALPLAN-DR (Planner)

### Principles
1. **Tier transition remains the scoreboard** — amplify capture, don’t invent a second product.
2. **Mute-first** — heal must read without audio.
3. **Privacy by default** — share artifacts never embed full save secrets.
4. **Anti-slop kill list is non-negotiable** for 90d.
5. **Falsify early** — mute-clip field test + pivot N gate growth spend.

### Decision drivers (top 3)
1. Differentiator is under-captured (text share only).
2. Competitor cyber-idles oversupply *skin*, undersupply *UI-state win*.
3. Operator time budget — one force-multiplier campaign, not feature soup.

### Viable options

| Opt | Plan | Pros | Cons |
|-----|------|------|------|
| **A (chosen)** | Capture the heal: ceremony + visual split still (+ optional loop) + TTA/TTH instrument + mute-clip field + pivot rebaseline | Multiplies #14–#19; aligns research; parallel lanes | Needs canvas/capture care |
| **B** | Content/economy expansion (more generators, deeper prestige) | Feels productive | Misses share/thesis; AD-envy |
| **C** | Full terminal OS rewrite / NETBREAK-like diegesis | Aesthetic purity | Destroys idle loop; out of scope |

**Invalidation B:** growth panel fails; mute clip still “numbers game.”  
**Invalidation C:** kill list / expand–contract; not browser-idle wedge.

### Pre-mortem (deliberate · 3)
1. **Canvas/CORS/perf** makes split capture flaky → still-first with DOM/CSS clone fallback; e2e on sanitized properties not pixel-perfect browser variance.  
2. **Mute-clip fails** after visual share → increase Tier 0 deprivation + ceremony contrast; freeze growth spend.  
3. **Ceremony fights reduced-motion / a11y** → final-state + SYSTEM_LOG always; motion optional.

### Test plan (deliberate)
| Layer | Coverage |
|-------|----------|
| Unit | healShare payload privacy; ceremony reduced-motion branch; funnel counters |
| Integration | SHARE_RESTORE invokes capture; artifact type from ticket 03 |
| E2e | visual-operator-capture + heal journeys; label non-truncation retained |
| Observability | local `cw.funnel` TTA/TTH/shareAttempt only |
| Field | mute-clip n=5 protocol |

---

## Architect review

**Role:** Architect · **Verdict:** **APPROVE with constraints**

### Steelman antithesis
“Skip ceremony. Ship a PNG export of the whole game window and call it a day. Players only care about ABPS.”

### Tradeoff tension
**Capture fidelity vs privacy/perf:** full-window screenshot is easy but risks leaking HUD numbers and save-adjacent state; pure canvas reconstruction is safer but more eng cost.

### Synthesis
Default **still-first split of chrome tiers** (left Tier 0 chrome, right current tier), generated from known tier classes / offscreen clone — not raw full save. Optional loop is Should. Ceremony is a thin state machine on existing `hex:tierAdvance` / `playHealMoment`, not a new subsystem god-object.

### Principle check
- No third currency / dual HUD / GameState rewrite.  
- Seams: `healShare.js` expand, thin `healCeremony.js` or extend `designTierSystem.playHealMoment`, optional `healCapture.js`.  
- Expand–contract only if capture needs pure helper.

### Risks called
- Over-coupling ceremony to `unlockTier` async audio path (e2e already stubs emit) — keep ceremony on event bus.  
- Landing OG asset size — compress stills.

---

## Critic review

**Role:** Critic · **Verdict:** **APPROVE**

### Checks
| Criterion | Result |
|-----------|--------|
| Principles ↔ Option A consistency | Pass |
| ≥2 real alternatives with invalidation | Pass (B, C) |
| Risk mitigation (pre-mortem) | Pass |
| Testable acceptance (map tickets) | Pass |
| Verification steps | Pass (unit/e2e/field/pivot) |
| Kill-list respect | Pass |
| Scope not feature soup | Pass — 12 tickets, hard spine short |

### Nits (non-blocking)
1. Ticket 03 should **default still-first** within 24h of start if no human decision, so 05 is not blocked indefinitely.  
2. Ticket 10 is Must but human-dependent — mark **blocking for growth spend**, not for code freeze of 05–06.  
3. Claim-audit 12 should not require 07/08/09 Shoulds.

### Critic constraint accepted
- **Must for ship:** 01–06, 12 (code+docs).  
- **Must for growth spend:** 10 + 11.  
- 07–09 Should.

*(Planner adopts: map Must for 10/11 is “growth gate”; implementation of 05–06 can merge before 10.)*

---

## ADR

| Field | Content |
|-------|---------|
| **Decision** | Execute Option A — Capture the heal campaign per map tickets 01–12 |
| **Drivers** | Capture gap; competitor matrix; mute-first; operator budget |
| **Alternatives** | B content expansion; C terminal OS rewrite |
| **Why A** | Multiplies existing spine; falsifiable; kill-list safe |
| **Consequences** | Defers prestige depth / Steam; requires capture eng + field test |
| **Follow-ups** | After pivot pass: prestige chapter credits; creator outreach |

---

## Execution staffing (after approval only)

| Lane | Work | Suggested mode |
|------|------|----------------|
| Loop | 02 | ultragoal sequential or single agent |
| Heal | 03→04→05→06 | team lane or sequential; **serial spine** |
| Growth | 01, 09, 10, 11 | human+agent; field test HITL |
| Gate | 12 | after Must code |

**Default handoff:** `$ultragoal` for ledger; `$team` for parallel A/B/D after approval.  
**Ralph:** only if user wants single-owner verification loop.  
**Do not implement in ralplan session.**

### Available agent types (roster)
- general-purpose / executor (impl)  
- explore (read-only)  
- test-engineer / verifier  
- critic / architect (re-review if plan changes)  
- writer (runbook docs)

---

## Goal-mode follow-up suggestions

- **`$ultragoal`** — default durable execution of map after approval  
- **`$team`** — parallel lanes A/B/D once 03 default locked  
- **`$ralph`** — fallback single-owner verify loop only if chosen  
- **`$to-tickets`** — materialize tracker issues from map if desired  
- Not `$autoresearch-goal` / `$performance-goal` unless scope shifts  

---

## Terminal planning state

| Field | Value |
|-------|--------|
| `planning_artifacts` | `map.md`, `issues/*`, `RALPLAN.md`, context snapshot |
| `ralplan_architect_review` | APPROVE with constraints (still-first capture; event-bus ceremony) |
| `ralplan_critic_review` | APPROVE (nits adopted) |
| `ralplan_consensus_gate.complete` | **true** (Architect→Critic order satisfied) |
| **Plan status** | **`shipped`** — PR #20 merged; docs closeout follow-up |

---

## What we need from you

Approve one of:

1. **Approve execution** → `/to-tickets` optional then implement Capture the heal (ultragoal/team)  
2. **Request changes** to destination, tickets, or Option B/C  
3. **Reject** — stay on ops-only (field mute-clip without eng campaign)  
