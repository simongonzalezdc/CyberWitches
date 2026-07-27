# Spec: Top 15 leverage campaign (Hex Compiler)

**Triage:** `ready-for-agent`  
**Map:** `.scratch/top-15-leverage/map.md`  
**Ralplan:** `.scratch/top-15-leverage/RALPLAN.md` (pending approval)  
**Base:** Forgejo `main` @ progression-wiring era (`f469dcd`+)

## Problem Statement

After identity-ship, residual finish, close-open-loops, silent-failure surface, and progression-wiring fixes, the game is more trustworthy—but the full-repo audit still shows **high-leverage holes**: progression can regress without CI noticing; a dead `gameState` twin confuses agents; questSystem is half-present; a **25× AB unlock gap** empties mid/late play; design-tier gates are easy to misunderstand; potions/inventory can lack display names; god-objects remain expensive to change; and GitHub lag vs Forgejo invites false “shipped” claims.

Players experience stuck Tier 0 chrome, missing post-prestige bonus confidence, pacing voids, and opaque systems. Operators/agents re-break fixed wires without e2e guards.

## Solution

Execute a **leverage-ordered campaign of 15 tickets** that (1) locks progression with automated smoke/e2e, (2) removes footguns and half-systems, (3) fixes the worst economy gap and secondary jumps, (4) makes design-tier gates player-legible, (5) completes potion display truth, (6) takes one more expand–contract slice each of GameState and AudioSystem, (7) documents Forgejo as SoT, and (8) closes with claim-audit evidence.

## User Stories

1. As a new player, I want the first session goals to lead into real progression, so that I am not stuck wondering if the game is broken.
2. As a player who earned enough AB and achievements, I want the UI tier to visibly restore, so that progressive revelation feels rewarding.
3. As a player near a design-tier gate, I want to know what I still need, so that I am not guessing about chrome unlocks.
4. As a player who prestiged, I want meditation to actually boost main production, so that the post-prestige loop matters.
5. As a player crafting lab potions, I want readable inventory names, so that rewards feel real.
6. As a player consuming a potion, I want a real effect, so that experiments are not fake rewards.
7. As a mid-game player, I want workstation unlocks to appear at a steady pace, so that I do not hit a multi-hour void.
8. As a late-mid player, I want secondary unlock gaps reduced, so that pacing stays intentional.
9. As a player viewing Stats, I want achievements and combo counts to be true, so that I trust the HUD.
10. As a player with meditation unlocked, I want the bonus line to reflect real state, so that I can plan production.
11. As a player stuck on boot/story, I want the game to recover or fail clearly, so that I am not staring at a black screen.
12. As a developer, I want e2e to fail if design tier wiring breaks again, so that regressions cannot ship silently.
13. As a developer, I want no `gameState.js.backup` twin, so that I do not edit the wrong file.
14. As a developer, I want questSystem either fully live or gone, so that I do not maintain a zombie system.
15. As a developer, I want GameState pure slices extractable, so that tests can pin production/buff/potion math.
16. As a developer, I want AudioSystem policy seams, so that tier music/SFX rules are testable.
17. As an agent operator, I want Forgejo documented as SoT, so that I do not open the wrong PR remote.
18. As an agent operator, I want a claim-audit at map end, so that “done” means evidence, not vibes.
19. As a player on a fresh save, I want tutorial mid-arc goals (Fire, Water, lab) to remain owned by TutorialSystem, so that first-run stays coherent.
20. As a player, I want silent storage restore (IndexedDB → localStorage) to remain logged, so that recovery is not invisible.
21. As a player, I want cast critical-compile events to remain diegetic, so that identity stays intact.
22. As a player in Tier 0, I want EXEC to remain the bright focus, so that first action is obvious.
23. As a player, I want workstation descriptions to stay non-empty, so that cards do not feel broken.
24. As a developer, I want expand–contract only, so that mega-rewrites do not freeze the game.
25. As a developer, I want shared boot/story dismiss helpers for e2e, so that visual and smoke tests are stable.
26. As a player who unlocks features, I want locked tabs to show honest unlock conditions, so that prestige gating is clear.
27. As a player, I want potion display names consistent across lab and inventory, so that I can find what I crafted.
28. As a developer, I want producer integrity tests to keep failing on broken recipe keys, so that economy edits stay safe.
29. As an operator, I want Must vs Should ticket clarity, so that map complete is falsifiable.
30. As a player, I want residual accepted risks (Tone unsafe-eval, npm dev audit) documented, so that security posture is honest.
31. As a developer, I want half-wired residual sweep after quest decision, so that no other zombie globals remain.
32. As a player, I want mid-arc lab goal to still point at RUN_PROTOCOL, so that experiments are discoverable.
33. As a developer, I want CI (`lint`, color-debt, typecheck, unit tests) green after every wave, so that ship quality holds.
34. As a player with many producers, I want unlock order to feel intentional, so that the compiler fantasy stays paced.
35. As a developer reading AGENTS.md, I want remote SoT one-liners, so that routing mistakes drop.

## Implementation Decisions

1. **Campaign structure:** 15 leverage-ordered tickets under local-markdown wayfinder map `top-15-leverage`.
2. **Must set:** 01–07, 10–11, 13, 15. Should: 08, 09, 12, 14.
3. **Wave order:** Hygiene+guards (03,01,02,11) → Product (04,05,06,07,13) → Ops/arch (10,08,09,12,14) → Claim-audit (15).
4. **Design tier e2e (01):** Assert body tier class / unlocked tiers after criteria; must use real achievements path.
5. **Meditation smoke (02):** Assert production mult path depends on meditationState bridge.
6. **Backup twin (03):** Remove or archive `gameState.js.backup`; exclude from typecheck/bundle.
7. **questSystem (04):** Default **archive/kill** if no E2E UI dependency; otherwise full wire—no half singleton.
8. **Economy (05):** Reduce max consecutive unlock ratio; preserve ingredient integrity; data-first edits to producers.
9. **Design-tier truth (06):** Default **explicit gate copy (A)**; hybrid only if e2e proves stuck long sessions.
10. **Potion display (07):** Single display-name source for all HIDDEN_RECIPES outputs.
11. **GameState slice (08):** One pure module (potion table, buffs, or production mult inputs)—not full rewrite.
12. **Audio slice (09):** Prefer SFX policy wire (`shouldAllowSfx`) or fade helpers—expand–contract.
13. **SoT docs (10):** AGENTS/README note: Forgejo origin for PR/merge; GitHub may lag.
14. **Boot e2e (11):** Shared dismiss helper; fail on stuck boot timeout.
15. **Secondary gaps (12):** After 05; retune next-worst ratios.
16. **Stats/HUD (13):** Real achievements, combo, meditation bonus visibility rules.
17. **Residual half-wired (14):** Inventory + fix/archive only player-path items after 04.
18. **Claim-audit (15):** Evidence table for Must tickets; honest residual list.
19. **Locks preserved:** AB/EK, hybrid hierarchy, TutorialSystem first-run ownership, meditation prestige gate, Tier 0 contract.
20. **Remotes:** No force-sync GitHub as part of this spec.

## Testing Decisions

### What makes a good test
- Assert **external behavior**: tier class, mult values, UI strings, CI exits—not private field names.
- Prefer highest existing seam: Playwright play.html flows; unit tests on pure modules and data integrity; source-bridge guards only where globals are the public contract.

### Modules / surfaces under test
- DesignTierSystem unlock behavior
- GameState production mult + potion effects
- PRODUCERS / HIDDEN_RECIPES integrity
- MeditationState bridge consumers
- e2e boot dismiss + tier path
- Docs presence for SoT (lightweight)

### Prior art
- `tests/unit/progressionWiring.test.js`
- `tests/unit/closeOpenLoops.test.js`
- `tests/unit/silentFailureSurface.test.js`
- `tests/unit/sessionShipMust.test.js`
- existing `e2e/` Playwright suite

## Out of Scope

- Viral/marketing campaigns and superlative quality goals
- Identity/currency fantasy rewrites
- Full rewrite of audioSystem or gameState
- Making IndexedDB primary (already decided dual-store / localStorage primary unless new ADR)
- Forced GitHub history rewrite
- npm force major upgrades for audit score alone
- Re-opening completed identity-ship tickets without regression proof

## Further Notes

- Map path: `.scratch/top-15-leverage/`
- Ralplan consensus: **APPROVE**, execution **pending approval**
- Operator can `/implement all` or wave-by-wave after approval
- Seams S1–S4 are the test architecture; confirm if you want a different primary seam before implement

## Seams (explicit check)

| ID | Seam | Why highest |
|----|------|-------------|
| S1 | Design tier unlock outcome | Player-visible chrome progression |
| S2 | Production multiplier outcome | Meditation/prestige value |
| S3 | Producer unlock data graph | Economy pacing edits |
| S4 | Potion name + effect | Lab reward truth |

If these seams look wrong, say so before `/implement`.
