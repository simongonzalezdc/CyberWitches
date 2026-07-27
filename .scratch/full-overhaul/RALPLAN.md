# RALPLAN — Hex Compiler Full Overhaul (Restoration Kernel)

**Status:** approved by user · to-spec + to-tickets published  
**Mode:** consensus · **deliberate** (full product + architecture rewrite risk)  
**Date:** 2026-07-27  
**Map:** `map.md`  
**SPEC:** `SPEC.md`  
**Context:** `.omx/context/full-overhaul-20260727T150551Z.md`

---

## RALPLAN-DR (Planner)

### Principles
1. **Fantasy is mechanical** — preservation physics and pipeline decisions are the product; chrome heal is celebration.
2. **Decision density over feature density** — cut clone content; sharpen tradeoffs.
3. **Pure Kernel, impure UI** — rules live in deterministic domain; UI projects.
4. **Privacy and ethics non-negotiable** — local-first, no gacha, no dual quest HUD, no hostage currencies.
5. **Holistic vision, phased delivery** — waves ship the same destination; no “permanent MVP that forgot the vision.”
6. **Falsifiable quality** — playtest metrics and economy tests beat vibes.

### Decision drivers (top 3)
1. Current play is genre-default idle under a strong skin; identity is under-delivered.
2. GameState/content sprawl blocks cutting-edge design iteration.
3. User rejected slice-thinking; demands full overhaul ambition + modern craft.

### Viable options

| Opt | Plan | Pros | Cons |
|-----|------|------|------|
| **A (chosen)** | Full Restoration Kernel: pipeline roles + fade/storage + storylets + taught prestige + pure Kernel/TS strangler | Matches ask; fixes root causes; future-proof | Large; migration risk |
| **B** | Experience-only rewrite on existing GameState (no Kernel) | Faster first playable | Tech debt freezes design speed; 100% improvement unlikely |
| **C** | Greenfield rewrite new repo/engine | Clean slate | Destroys continuity, PWA users, months before playable; overkill |

**Invalidation B:** User asked for cutting-edge tech+design and 100% improvement; god-object prevents that.  
**Invalidation C:** Continuity, PWA, and existing combat-tested systems (meditation, saves) are assets; strangler is enough.

### Pre-mortem (deliberate · 3)
1. **Migration breaks saves → rage quits.** Mitigation: dual-read old snapshots; explicit migrate; “export backup” prompt; property tests on migrate.  
2. **Fade physics feels punishing → churn.** Mitigation: fade off or trivial first 5–10 min; offline-fair; playtest gate before content freeze.  
3. **Rewrite never ends / second system soup.** Mitigation: SPEC non-goals; content caps (≤16 pre-prestige modules); claim-audit ticket 20; kill feature adds outside map.

### Test plan (deliberate)
| Layer | Coverage |
|-------|----------|
| Unit | Kernel tick, decay, costs, prestige gain, storylet gates, migrations |
| Property | Growth curves monotonic; decay never NaN; save round-trip |
| Integration | Prestige 1 path from empty save; meditation bonus applies |
| E2E | Cold boot → first automation → chapter beats → prestige modal honesty |
| Observability | Local funnel: TTA, time-to-prestige, chapter reaches (no PII) |
| Playtest | §8 qualitative panel n≥5 |

---

## Architect review

**Role:** Architect · **Verdict:** **APPROVE with constraints**

### Steelman antithesis
“Don’t rewrite. Ship more content and better balance on GameState. Players don’t care about Kernels. A 100% improvement claim is marketing; strangler is months of zero player-facing value.”

### Tradeoff tension
**Design freedom vs ship continuity.** Pure Kernel enables correct fantasy physics and safe iteration; strangler costs calendar time and dual-path bugs. Greenfield is cleaner but wastes battle-tested meditation/save/PWA work.

### Synthesis
Adopt **Option A with strangler discipline**:  
1. Freeze Kernel interfaces first (ticket 01–02).  
2. Move tick + resources + pipeline pricing next (03–05).  
3. UI remains vanilla projectors until contracts stable (13).  
4. No second framework; no big-bang delete of play.html until Kernel owns rules.  
5. Meditation/prestige **adapt** to Kernel events rather than rewrite from zero in week 1.

### Principle check
- Fantasy mechanical: fade/storage + pipeline ✓  
- Decision density: content caps + path strategies ✓  
- Pure Kernel ✓  
- Ethics kill list ✓  
- Holistic vision with waves as delivery ✓  

### Risks called
- Dual-write period if UI still mutates GameState — **forbid**: all writes through Kernel commands.  
- Storylet engine becoming a second quest HUD — **forbid**: storylets are modal/log cards, one primary contract rail only.  
- TS migration stalling JS — **strangler**: Kernel TS first, UI JS adapters OK.

### Constraints for execution
1. Command API: `kernel.dispatch({type, payload})` only path for player actions.  
2. Content schema versioned; CI fails on invalid graphs.  
3. Feature freeze outside map during overhaul (empower-orchestrator: no random systems).  
4. First playable vertical of the **whole fantasy** (fade+pipeline+chapter through prestige teach) before path-depth expansion — this is not “a slice instead of overhaul”; it is the **minimum complete expression of the full vision’s core law**.

---

## Critic review

**Role:** Critic · **Verdict:** **APPROVE**

### Checks
| Criterion | Result |
|-----------|--------|
| Principles ↔ Option A | Pass |
| ≥2 alternatives + invalidation | Pass (B, C) |
| Pre-mortem deliberate | Pass |
| Expanded test plan | Pass |
| Kill-list respect | Pass |
| Testable acceptance (§8 + tickets) | Pass |
| Scope not infinite soup | Pass (caps + non-goals + ticket 20) |
| User “no slices” honored | Pass — waves are delivery of full destination; constraint #4 is complete-core-law not a reduced product forever |

### Nits (non-blocking)
1. Name AB carefully — dual meaning confuses; resolve in ticket 01 glossary.  
2. Ticket 19 Worker tick is Could — do not staff early.  
3. Human playtest (16) is Must for “100% improvement” claims; do not ship marketing of overhaul without it.  
4. Capture-the-heal codepaths must be listed as **adapters** to Kernel events in 12 so they don’t re-fork presentation logic.

### Critic constraint accepted
- **Must for “overhaul shipped”:** tickets 01–17, 20 + §8 playtest gates.  
- **Should:** 18. **Could:** 19.  
- No public “100% better” claim until 16 green.

---

## ADR

| Field | Content |
|-------|---------|
| **Decision** | Execute Option A — Full Restoration Kernel overhaul per SPEC §0–§11 and map tickets 01–20 |
| **Drivers** | Fantasy/mechanics gap; decision density; tech substrate; user demand for full overhaul |
| **Alternatives** | B experience-only on GameState; C greenfield new game |
| **Why A** | Only option that delivers mechanical fantasy + modern iteration speed without discarding PWA/save/meditation assets |
| **Consequences** | Multi-wave delivery; temporary dual adapters; content cuts; explicit migration UX |
| **Follow-ups** | After Prestige 1 arc proven: path depth, optional Worker tick, Steam only if D1/prestige metrics hold |

---

## Execution staffing (after approval only)

| Lane | Work | Mode |
|------|------|------|
| Kernel | 01,02,05,06,14 | ultragoal sequential |
| Economy | 03,04,15,18 | team after 02 |
| Narrative | 07,17 | parallel with Kernel once 01 frozen |
| Loop | 08,09,10,11 | after 04+07 |
| UI | 12,13 | after 08 contracts |
| Gate | 16,20 | end |

**Default handoff:** `$ultragoal` ledger + `$team` for Economy‖Narrative after Kernel contracts.  
**Ralph:** only if single-owner verification preferred.  
**Do not implement in ralplan session.**

### Agent roster
general-purpose, explore, plan/architect, critic, test-engineer, writer, executor (post-approval)

---

## Goal-mode follow-up suggestions

- **`$ultragoal`** — default durable execution of map after approval  
- **`$team`** — parallel Economy + Narrative after 01/02  
- **`$ralph`** — fallback single-owner loop only if chosen  
- Not `$performance-goal` unless tick cost becomes the problem  
- Not `$autoresearch-goal` unless story/world research reopened  

---

## Terminal planning state

| Field | Value |
|-------|--------|
| `planning_artifacts` | `SPEC.md`, `map.md`, `RALPLAN.md`, context snapshot |
| `ralplan_architect_review` | APPROVE with constraints |
| `ralplan_critic_review` | APPROVE (nits accepted) |
| `ralplan_consensus_gate.complete` | **true** (Architect→Critic order) |
| **Plan status** | **`approved`** — PRD + tickets published; implement via frontier |

---

## What we need from you

1. **Approve execution** of Option A (Restoration Kernel full overhaul)  
2. **Request changes** (e.g. force/no fade, graph vs list UI, rename AB)  
3. **Reject** and stay on incremental ops  

On approval: run `$ultragoal` / `$team` against map W0 frontier (tickets 01–02).

---

## Vision summary (for humans)

**Today:** Competent multi-essence web idle with strong terminal skin and a celebration UI-heal; story is a modal; midgame is clone ladders; GameState is a gravity well.

**Tomorrow:** A preservation *game* — you design a pipeline against fade, chapters mark real losses and victories, prestige is a taught rebirth, specialization is a strategy, Kernel is pure and testable, heal is fireworks when you earn it.

That is the 100% improvement: not louder chrome, **a different and better match to play.**
