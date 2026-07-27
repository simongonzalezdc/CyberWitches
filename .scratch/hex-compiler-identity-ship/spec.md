# Spec — Hex Compiler identity lock + player-truth polish

**Status:** done  
**Date:** 2026-07-27  
**Sources:** adversarial audit 2026-07-26; wayfinder identity locks; ralplan O1-synthesis (Critic APPROVE); approved test seams S1–S8

---

## Problem Statement

Hex Compiler looks green in CI but is not shippable with pride. Players cannot see the full resource economy, currency names disagree across surfaces, the Tier 0 “UI heals as you play” promise is invisible at first paint, mobile tooltips can kill primary clicks, meditation progress can silently reset, cast “jackpot” language fights the compiler fantasy, the manual documents a deleted game, and the first session teaches a spreadsheet without a clear short goal. The product identity (compiler chrome compiling occult content) was never locked, so fixes thrash instead of converging.

## Solution

Lock product identity and make player-facing truth match live systems: hybrid hierarchy (system chrome = compiler; lore content = occult magic), Arcane Bits (AB) / Eldritch Keys (EK) as the only living currency names, hard Tier 0 progressive restoration at first paint, full resource monitor, safe notifications, working mobile primary actions, meditation integrity post-prestige, one first-session compile goal owned by TutorialSystem, diegetic critical-compile cast feedback, and a manual that describes the live game. Prefer existing seams; no multi-session wayfinder queue and no architecture vanity rewrites as the main path.

## User Stories

1. As a new player, I want the resource monitor to show all elemental essences (not only Fire), so that I understand what I am earning and what crafts cost.
2. As a new player, I want first paint to feel like a broken / incomplete terminal (Tier 0), so that progressive restoration is a real story rather than marketing copy.
3. As a returning player, I want the same currency name everywhere (Arcane Bits / AB), so that I am not gaslit by SE / Aether Bits / Arcane Bytes drift.
4. As a prestige player, I want Eldritch Keys (EK) named consistently, so that prestige rewards are legible.
5. As a mobile player, I want Craft and Cast to still fire when tooltips exist, so that I am not soft-locked on primary verbs.
6. As a player, I want notifications that cannot inject arbitrary HTML by default, so that untrusted strings cannot XSS me.
7. As a prestige player who uses meditation, I want waves/sessions/kills stats to survive save and load, so that my production bonus does not silently vanish.
8. As a prestige player in meditation, I want stuck distractions detected by real motion, so that waves do not hang forever.
9. As a new player, I want one clear short compile goal early (Stabilize Fire sector — craft 1 Fire Forge), so that the first session is not pure aimless grinding.
10. As a new player, I want that goal to come from the live tutorial owner only, so that I do not get double onboarding modals.
11. As a player casting EXEC, I want rare bonuses framed as critical compile / overclock events, so that the compiler fantasy holds.
12. As a player, I want cast bonus feedback to actually appear on screen, so that rare events are felt rather than silent.
13. As a self-directed player, I want the game manual to match live workstations and currencies, so that I do not follow dead strategies.
14. As a landing visitor, I want real screenshots / hero art instead of empty black cards, so that the product looks intentional.
15. As a design-system consumer, I want the root design-system version contract on both entrypoints, so that theme reconciliation has a stable hook.
16. As a contributor / agent, I want CONTEXT glossary to match live player language, so that agents do not reintroduce drift.
17. As a player at higher design tiers, I want counters and chrome to gain color and polish only after unlocks, so that Tier 0 remains honest.
18. As an operator, I want security-sensitive remote credential rotation called out as human-only, so that agents do not pretend they rotated my PAT.
19. As a player using assistive tech, I want notifications to remain polite live regions with safe text, so that status updates stay accessible.
20. As a player, I want help and HUD copy to speak diagnostics (compiler) while lore can stay occult, so that hybrid hierarchy is consistent.
21. As a first-session player, I want EXEC cast amounts and AB meaning to match live numbers in docs, so that the manual does not lie about 0.1 vs 0.15 AB.
22. As a tester, I want falsifiable acceptance on each seam, so that “done” is not vibes.
23. As an agent implementing a ticket, I want thin vertical slices that leave CI green, so that work can land without a mega-branch.
24. As a player after prestige, I want meditation still gated post-prestige (no early teaser redesign), so that scope stays repair-first.
25. As a product owner, I want architecture god-object splits deferred unless leftover, so that player trust ships first.

## Implementation Decisions

### Product identity (locked)
- Fantasy: **hybrid with hierarchy** — chrome/system language is compiler/diagnostics; content/lore is occult magic being compiled.
- Primary currency: **Arcane Bits (AB)**. Prestige currency: **Eldritch Keys (EK)**.
- Banned as living names: SE, Spell Energy, Aether Bits, Arcane Bytes (historical notes in changelog may mention old names once).
- Tier 0 progressive restoration is a **hard product contract**, not a soft aesthetic.
- First session posture: **repair-first** + one short compile goal; no brand-new systems.
- Meditation: **post-prestige only** this effort; fix integrity, no early teaser redesign.
- Compile goal copy (locked): `COMPILE_GOAL: Stabilize Fire sector — craft 1 Fire Forge.`
- Compile goal owner (locked): **TutorialSystem only**. Forbid new onboarding module, dailies-as-primary for this goal, and wiring orphan legacy onboarding/tutorial stacks.
- Cast bonus: rename jackpot framing to diegetic **critical_compile** / **compile_overclock**; implement player-visible feedback (dead feedback hook is in scope).

### Test seams (approved)
- **S1 Boot HTML contract** — full counters; design-system version attr; Tier 0 shell at first paint.
- **S2 Currency canon surface** — living copy is AB/EK only.
- **S3 Notifier port** — text-safe default; trusted HTML only when intentional (e.g. known icon templates).
- **S4 Touch / tooltip attach** — tooltips do not preventDefault primary clicks; long-press for tooltip.
- **S5 Meditation save snapshot** — stats round-trip; stuck = position delta.
- **S6 Design-tier apply-at-boot** — apply current tier on boot; fresh save is Tier 0-looking.
- **S7 TutorialSystem** — sole owner of the first-session compile goal.
- **S8 Cast bonus feedback** — visible critical-compile / overclock; no player-facing jackpot on that path.

### Module / surface changes (no stale paths in tickets; high-level only)
- Play and landing HTML entrypoints for counters, root attrs, Tier 0 body class, landing media.
- HUD resource counter update path (must find nodes that exist).
- Design tier system: reconcile version + apply tier at boot, not only on unlock checks.
- Notification manager: default text path; explicit trusted HTML path; rate limit preserved.
- Custom tooltips: mobile long-press without killing click pipeline.
- Meditation state: load all saved stats; stuck detection uses prior position.
- Game cast path: diegetic bonus types + wired feedback.
- TutorialSystem: compile goal step + announcement.
- Glossary / manual / UI strings: currency and producer truth from live data tables.
- Landing: wire existing screenshots / generated Kyanite assets where placeholders exist.

### Architecture rules
- Prefer existing seams over new modules.
- Do not merge the three onboarding stacks this effort.
- Do not split audioSystem or gameState as the main path.
- Human-only: rotate/revoke embedded GitHub PAT on remote; strip credentials from remote URL after rotation.
- Partial work may already exist on the working tree from an interrupted implement pass — treat the spec + tickets as source of truth; complete or clean up under tickets, do not double-implement blindly.

### Freeze hierarchy
- **Must:** S1–S8 green + CI (lint, typecheck, unit tests, prod build).
- **Should:** landing media not empty.
- **Niceto:** FA→CSS icons on prod path; prod-path interval leak gates; formatShort NaN/Infinity; CSP notes.

## Testing Decisions

### What makes a good test here
- Assert **external behavior** a player or agent can observe (DOM contract present, string ban list, save round-trip fields restored, feedback copy shown, no preventDefault on touchstart for tooltips).
- Do **not** assert private method names, line numbers, or incidental CSS class fashion beyond the Tier 0 / design-system contracts.
- Prefer highest approved seam: HTML contract and public APIs over internal helpers.

### What will be tested
- S1: play/index markup contracts (counters, design-system version, tier-0 shell).
- S2: living-name ban across player-facing modules + CONTEXT.
- S3: notification text vs trusted HTML behavior.
- S4: tooltip mobile handler does not call preventDefault on touchstart.
- S5: meditation load restores wave/kill/session stats; stuck uses position delta semantics.
- S6: boot applies tier (behavior or integration-level assertion that tier class / reconciliation runs).
- S7: TutorialSystem contains the locked compile goal copy and owns it.
- S8: cast bonus type is diegetic; feedback hook is defined and produces player-visible copy.

### Prior art
- Existing design-system version unit coverage.
- Broad Jest unit suite (hundreds of tests) under the project’s unit test layout.
- Prefer adding focused contract tests alongside existing patterns rather than a new test framework.

## Out of Scope

- Multi-session wayfinder ticket cadence as the delivery model (operator rejected; use this spec + tickets).
- Early pre-prestige meditation teaser redesign.
- Full onboarding triple-merge / ARCH-01 deletion campaign.
- God-object rewrites of audio or game state as primary work.
- CSP nonce migration as a must.
- Color-debt baseline to zero.
- npm toolchain CVE campaign as a must.
- Agent rotating GitHub PATs (human-only).
- Force-syncing local main with remote history without explicit operator approval.

## Further Notes

- Ralplan consensus selected **O1-synthesis**: vertical player-risk batches, with Batch 1 coupling counters + tier-safe markup + minimal Tier 0 shell (not “pretty counters then Tier 0 later”).
- Evidence base for original findings: `artifacts/adversarial-audit-2026-07-26/MASTER_ADVERSARIAL_AUDIT.md`.
- Prior planning artifacts (non-canonical once this file is published): `.omx/plans/prd-hex-compiler-session-ship.md`, earlier SPEC under artifacts — prefer this tracker spec as the agent source of truth.
- Generated assets under the audit artifacts folder may be integrated for landing Should work.
- Domain glossary in CONTEXT must say Arcane Bits (not Bytes) after S2.

## Comments

- Seams S1–S8 approved by operator 2026-07-27.

## Tickets

Published under `issues/` (ready-for-agent):

| # | Title | Blocked by |
|---|--------|------------|
| 01 | Boot resource truth + Tier 0 shell | — |
| 02 | Currency canon (AB / EK only) | — |
| 03 | Safe notifications | — |
| 04 | Mobile tooltips that don’t kill clicks | — |
| 05 | Meditation integrity | — |
| 06 | First-session compile goal (TutorialSystem) | 01 |
| 07 | Critical-compile cast feedback | — |
| 08 | Live game manual | 02 |
| 09 | Landing media (Should) | — |
| 10 | Ship gate green | 01–08 (09 optional) |

Frontier (no blockers): **01, 02, 03, 04, 05, 07, 09**.
