# Spec: Heal-moment critical path (Hex Compiler)

**Triage:** `ready-for-agent`  
**Map:** `.scratch/ideal-critical-path/map.md`  
**Ralplan:** `.scratch/ideal-critical-path/RALPLAN.md` (pending execution approval)  
**Multi-model synthesis:** `.scratch/ideal-critical-path/SYNTHESIS.md`  
**Base:** Forgejo `main` after top-15 leverage (`be1bb84`+)

## Problem Statement

Hex Compiler’s unique product emotion is **broken terminal chrome healing as the player preserves magic**. Technical campaigns made progression trustworthy, but the **heal is still easy to miss**, the **first session can feel goal-empty after the tutorial**, **tier advances are not a single observable event**, and there is **no one-tap shareable recovery artifact**. Without those, the game plays like a competent generic idle with a lore coat—so players do not retain or recommend it for the right reason, and distribution has nothing sharp to point at.

Players need: competence fast, a always-clear next compile goal, unmissable system-restore moments, honest save recovery, post-prestige consequence they can feel, and a way to show the heal without leaking a full save.

## Solution

Execute the **heal-moment critical path**: force golden browser paths in CI; fix production-mult cache truth; keep unlock density gated; install an always-on post-tutorial goal stack; emit a first-class **tier-advance** event; package heal as visual + SYSTEM_LOG + optional stinger; surface meditation production delta; close remaining save-outcome UX; ship a **sanitized** capture/share at heal; align landing thesis to before/after; run a prestige chapter beat; then light growth ops (creator seed, community post) with a 30-day share pivot gate. No gacha, no third currency, no god-object rewrite, no dual quest HUD.

## User Stories

1. As a new player, I want EXEC to feel like compiling immediately, so that I understand the core verb in seconds.
2. As a new player, I want a clear next compile goal after the tutorial ends, so that I am never staring at a silent dashboard.
3. As a new player, I want to reach automated production quickly, so that the idle promise is kept.
4. As a player approaching a design tier, I want to know what is still required, so that chrome restore feels earned not random.
5. As a player who meets tier criteria, I want an unmissable restore moment, so that the game’s thesis lands emotionally.
6. As a player who just healed chrome, I want a one-tap shareable before/after, so that I can show a friend without exporting my whole save.
7. As a returning player, I want offline and save recovery to be honest, so that I trust leaving the tab open.
8. As a player whose save was repaired, I want to be told, so that silent corruption never looks like “the game reset me.”
9. As a player with meditation unlocked, I want to see how a run changed production, so that the minigame feels consequential.
10. As a player about to prestige, I want a clear preview of what resets and what persists, so that prestige feels like a chapter not a punishment.
11. As a player after first prestige, I want goals pointing at boons and meditation, so that the new arc starts immediately.
12. As a player in the lab, I want discoveries to matter mid-run, so that experiments are not a dead tab.
13. As a streamer, I want a demo seed and visible heal moment, so that a short clip explains the game.
14. As a visitor on the landing page, I want the broken→healed thesis in one line plus media, so that I click Play for the right reason.
15. As a developer, I want CI to fail if golden progression paths break, so that silent regressions cannot merge.
16. As a developer, I want production mult cache to stay correct when buffs or meditation change, so that players never see lying ABPS.
17. As a developer, I want unlock density enforced by test, so that economy voids cannot return unnoticed.
18. As a developer, I want a single tier-advance event, so that audio, UI, log, and share subscribe without dual wiring.
19. As a developer, I want scoped telemetry only on tier/share/save outcomes, so that we can tune without surveillance sprawl.
20. As a player with reduced motion, I want heal spectacle to remain optional or safe, so that accessibility is not traded for juice.
21. As a player, I want diegetic language on critical compile events, so that rewards never feel like a slot machine.
22. As a player, I want SYSTEM_LOG to narrate restores and failures, so that the terminal fantasy stays coherent.
23. As an operator, I want a 30-day share pivot rule, so that we stop spending on virality if the heal does not travel.
24. As an operator, I want Forgejo main as ship truth, so that mirrors cannot fake completion.
25. As a player, I want no third currency or gacha, so that the recovery fantasy is not diluted.
26. As a player, I want sensory richness to unlock with tiers, so that spectacle is earned.
27. As a QA agent, I want dist/prod smoke, so that unit-green is not confused with playable.
28. As a player, I want inventory potion names readable, so that lab rewards feel real (already partially shipped; must not regress).
29. As a player, I want cast and craft failures explained, so that friction teaches.
30. As a designer, I want kill-list protection against feature soup, so that the critical path stays sharp.
31. As a player mid-session, I want at most one primary goal, so that attention is not fragmented.
32. As a player who shares, I want defaults that do not leak EK/prestige secrets in a URL, so that share is safe.
33. As a maintainer, I want claim-audit evidence for Must tickets, so that “done” is falsifiable.
34. As a player on first prestige, I want the ceremony to reference system recovery, so that reset is diegetic.
35. As a community member, I want a press-kit style before/after, so that recommendations carry the thesis.
36. As a player, I want meditation runs short and readable, so that post-prestige activity is optional mastery not a second job (Should depth, not rewrite).
37. As a developer, I want expand–contract only if god-object work appears, so that velocity survives.
38. As a player, I want offline progress honest and finite, so that return visits feel fair.
39. As a player, I want tab unlock conditions truthful for boons/meditation, so that prestige gating is clear.
40. As an agent implementing this, I want vertical tickets with blockers, so that parallel lanes do not thrash the same spine.

## Implementation Decisions

1. **Campaign shape:** Heal-moment critical path with waves W0–W4 and parallel lanes (CI, Loop, Heal/Event, Economy/UX, Growth).
2. **North Star metric proxies:** time-to-first-heal, noticeability of heal, share attempts, save-loss/recovery visibility, progression CI green.
3. **Force-multiplier:** First-class **tier advance event** is the spine; heal package, share, and telemetry subscribe to it.
4. **W0 foundation (parallel):** required Playwright smoke+progression in CI; mult-cache invalidation tests; dist/prod smoke; unlock-ratio CI bound.
5. **W1 spine (parallel):** always-on post-TutorialSystem goal stack; onTierAdvance emission; scoped funnel events (tier/share/save only).
6. **W2 payoff:** unmissable heal package (visual + SYSTEM_LOG + optional stinger); first-session automation pacing; meditation Δ mult feedback; save outcome UX closeout.
7. **W3 share/return:** sanitized capture (no full-save deep link by default); landing thesis media; prestige ceremony + post goals.
8. **W4 growth:** creator demo seed, community post, 30-day share pivot threshold decision—only after heal exists.
9. **Anti-slop kill list (90d):** no third currency; no gacha/pay-power; no guilds; no CSS framework migration; no GameState mega-rewrite; no dual quest HUD; no Steam-before-D1; no streak-hostage; no analytics sprawl.
10. **Meditation depth:** feedback and clarity first; full meditation re-architecture is out of this campaign.
11. **QuestSystem:** remains archived unless a later decision reopens with redesign.
12. **Share privacy:** default artifact is chrome/tier presentation, not raw save payload in URL.
13. **Telemetry:** opt-in or local-first preferred; minimum event set only.
14. **Seams:** prefer highest behavioral seams (below); expand–contract only if event bus requires a small pure helper.
15. **Remotes:** Forgejo remains PR/merge source of truth.
16. **Identity locks preserved:** AB/EK, hybrid hierarchy, TutorialSystem first-run ownership, Tier 0 hard contract, diegetic compile language.

## Testing Decisions

### Good tests
- Assert **external behavior**: body tier class, goal visible, event observed by subscriber, share artifact properties, CI job failure modes, mult values after buff/meditation change.
- Prefer existing Playwright e2e and unit seams over new frameworks.
- Avoid coupling to private field names where a public outcome exists.

### Surfaces under test
- Design tier unlock + advance event
- Production multiplier cache invalidation
- Goal stack presence and advancement
- Heal moment side effects (log/UI class/audio hook)
- Save decode outcome player messaging
- Unlock ratio data lint
- Smoke/progression e2e as required CI

### Prior art
- `tests/unit/progressionWiring.test.js`, `top15Leverage.test.js`, `closeOpenLoops.test.js`, `silentFailureSurface.test.js`
- `e2e/smoke.spec.js`, `e2e/progression-tier.spec.js`, `e2e/helpers/dismissOverlays.js`

## Out of Scope

- Mass-market UA spend and ad networks
- Gacha, jackpot framing, pay-power, energy systems
- Second prestige layer / pet metas / new currencies
- Guilds, global leaderboards, social graph
- Full audioSystem or GameState rewrite
- Full meditation redesign as a second game
- Steam launch as a Must of this campaign
- Content-volume farm (dozens of new producers/potions) before funnel proves heal stickiness
- Resurrecting archived questSystem as a dual onboarding owner

## Further Notes

- Multi-model panels (GLM-5.2, GPT-5.6 Sol medium, MiniMax-M3, Grok) converged on this spine; Kilo/Opus free lane failed this run.
- Ralplan status: consensus APPROVE; **execution pending user approval**.
- Tickets published via `/to-tickets` (approved, **max parallel**): `.scratch/ideal-critical-path/issues/01–16` all `ready-for-agent`.

## Seams (confirm)

| ID | Seam | Why highest |
|----|------|-------------|
| **S1** | Design-tier advance **outcome** (event + body/unlocked state) | Product scoreboard |
| **S2** | Production multiplier **outcome** after buff/meditation | Truthful numbers |
| **S3** | Goal stack **visible primary objective** | Session competence |
| **S4** | Golden path **e2e pass/fail in CI** | Trust floor |
| **S5** | Share artifact **sanitized properties** | Growth without leak |

If these seams are wrong, say so before implement.
