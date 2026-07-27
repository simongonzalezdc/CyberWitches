# PRD — Hex Compiler: Restoration Kernel (Full Overhaul)

**Status:** approved · ready-for-agent  
**Date:** 2026-07-27  
**Source:** RALPLAN consensus (Architect+Critic APPROVE) + user approval  
**Codename:** Restoration Kernel  
**Map:** `map.md` · **Brainstorm SPEC:** `SPEC.md` · **Ralplan:** `RALPLAN.md`  
**Tracker:** local `.scratch/full-overhaul/issues/` · label `ready-for-agent`

---

## Problem Statement

As a player of Hex Compiler, the game *looks* like a distinctive terminal fantasy but *plays* like a generic multi-resource idle: parallel building ladders, a thin story modal, under-taught prestige, and specialization that arrives too late to shape identity. Progress is mostly “buy the next unlocked thing.” The interface-heal moment is memorable, but the match underneath does not force preservation decisions or rising stakes. As a developer, a large GameState god-object and untyped content make it hard to ship cutting-edge design safely.

Players need a game where **preserving fading magic is the strategy**, not only the marketing line — with a modern, testable domain core.

## Solution

Rebuild Hex Compiler as **Restoration Kernel**:

1. **Preservation physics** — soft fade on unstored essence + storage buildings (one clear law).  
2. **Pipeline roles** — Capture, Store, Bind, Compile, Shield instead of elemental clone spam.  
3. **Chaptered narrative** — storylets + qualities at real gates through Prestige 1+.  
4. **Taught prestige + affinity** — rebirth with strategy paths, not only mult tables.  
5. **Optional Meditation mastery** — short first win, unmissable payoff.  
6. **Design-tier heal** — retained as earned celebration, rebound to chapter milestones.  
7. **Pure Kernel** — deterministic tick, command API, typed content schema, gradual TypeScript, UI as projector.  

Local-first privacy, no gacha, no dual quest HUD, browser PWA remain.

## User Stories

1. As a new player, I want a clear primary verb (EXEC), so that I always know how to act in the first seconds.  
2. As a new player, I want essence I do not store to slowly fade, so that building storage feels like preservation, not busywork.  
3. As a new player, I want the first minutes soft on fade, so that I learn before I am punished.  
4. As a player, I want to build Capture modules, so that I pull more ambient magic.  
5. As a player, I want to build Store modules, so that my essence survives decay.  
6. As a player, I want to build Bind modules, so that multi-essence streams become Aether/purity.  
7. As a player, I want to build Compile modules, so that preserved stock becomes lasting progress.  
8. As a player, I want scarce Shield modules, so that I can slow global fade as a strategic choice.  
9. As a player, I want each purchase to change my pipeline, so that I make tradeoffs, not shopping lists.  
10. As a player, I want ≤16 core pre-prestige modules, so that the early game stays sharp.  
11. As a player, I want one primary compile contract on screen, so that I am not split across dual quest HUDs.  
12. As a player, I want contracts framed as sector/chapter stakes, so that goals feel dramatic, not administrative.  
13. As a player, I want short storylet cards at chapter gates, so that the world advances with my progress.  
14. As a player, I want rare A/B story choices that set qualities, so that my run feels slightly mine.  
15. As a player, I want specific terminal imagery (addresses, failing sectors), so that the story is not generic idle apocalypse.  
16. As a player, I want chapter 0–7 through first prestige to form one arc, so that prestige feels like finishing a short game.  
17. As a player, I want projected Eldritch Keys and a soft prestige recommend band, so that I know when to ascend.  
18. As a player, I want a clear persist/reset preview before prestige, so that I ascend without fear of unknown loss.  
19. As a player, I want first prestige to grant a sharp, immediate toy, so that rebirth is rewarding.  
20. As a player, I want my pre-prestige build to foreshadow affinity, so that specialization feels earned.  
21. As a player, I want four specialization paths that change optimal pipeline play, so that replays differ.  
22. As a player, I want Meditation optional after prestige, so that pure idle play still progresses.  
23. As a player, I want a ≤3 minute first Meditation session with clear production payoff, so that the side mode teaches itself.  
24. As a player, I want design-tier heals when I complete real milestones, so that chrome celebration matches achievement.  
25. As a player, I want mute-readable SYSTEM_RESTORE ceremony on tier advances, so that the reward is legible without audio.  
26. As a player, I want SHARE_RESTORE optional and privacy-safe, so that I can export a still without leaking my save.  
27. As a player, I want dailies optional and non-hostage, so that missing a day is fine.  
28. As a player, I want achievements as long-tail mastery, so that they do not compete with the primary contract.  
29. As a mobile player, I want one-thumb EXEC and reachable pipeline controls, so that the game works on a phone.  
30. As a reduced-motion player, I want final-state heal feedback without motion sickness, so that a11y is real.  
31. As a returning player, I want offline-fair fade rules, so that I am not ruined for closing the tab.  
32. As a returning player, I want my save to migrate cleanly, so that overhaul does not delete my run without warning.  
33. As a power user, I want a dense list/pipeline view, so that I can optimize efficiently.  
34. As a new player, I want progressive disclosure, so that midgame menus do not dump everything at once.  
35. As a developer, I want a pure Kernel command API, so that all rules are testable without the DOM.  
36. As a developer, I want typed content validated in CI, so that broken graphs never ship.  
37. As a developer, I want deterministic ticks with seeds, so that balance bugs reproduce.  
38. As a developer, I want versioned migrations, so that schema evolution is safe.  
39. As a developer, I want UI as a projector, so that presentation refactors do not corrupt economy rules.  
40. As a developer, I want property tests on growth/decay, so that curves cannot go NaN or negative silently.  
41. As a designer, I want local funnel metrics (automation, prestige, chapters) without PII, so that we tune the arc.  
42. As a player, I want no gacha and no pay-power, so that trust stays intact.  
43. As a player, I want no third hostage currency, so that the economy stays readable.  
44. As a player, I want the post-prestige path to deepen my affinity, so that long-term identity exists.  
45. As a player, I want over-capacity essence loss to be visible (“lost to the void”), so that storage pressure is understandable.  
46. As a player, I want critical-compile events to feel like system events, so that they are not casino slop.  
47. As a QA tester, I want a cold-boot e2e path to prestige teach, so that the arc cannot regress.  
48. As a stakeholder, I want claim-audit evidence for Must tickets, so that “overhaul shipped” is falsifiable.  
49. As a player, I want ≤20 early inscriptions with clear roles, so that upgrades are choices.  
50. As a player, I want legacy clone ladders parked or removed, so that the pipeline stays coherent.

## Implementation Decisions

### Primary seam
**Kernel command API** is the single primary domain seam:

- Player/UI issues commands (cast, craft, prestige, choose-storylet, start-meditation, …).  
- Kernel applies pure transitions and emits domain events.  
- UI projectors subscribe to state/events; they do not own economy rules.  

Prefer this seam over new ad-hoc services per feature.

### Modules (deep)

| Module | Responsibility | Interface idea |
|--------|----------------|----------------|
| Kernel | Own state machine + dispatch | `dispatch(cmd) → { state, events }` |
| Resources | Essence bags, caps, fade | pure functions of state+dt |
| Pipeline | Buildings by role, craft costs | content-driven graph |
| Progress | Chapters, qualities, contracts | gate checks + storylet eligibility |
| Prestige | Keys, affinity, boons, reset rules | `preview` + `commit` |
| Meditation | Session sim + production mult delta | optional; bonus applied via Kernel |
| Content schema | Validate producers/upgrades/storylets | CI validator |
| Save codec | Snapshot + migrate | version field |
| Projectors | HUD, pipeline UI, log, heal ceremony | read-only to Kernel state |
| Heal/share | Celebration + privacy-safe export | listens to tier events |

### Architecture decisions (from ADR)
- Option A: full Restoration Kernel (not experience-only on GameState; not greenfield repo).  
- Strangler migration: Kernel grows; GameState becomes adapter then shrinks.  
- Soft fade + storage as the one default physics law.  
- Storylets + qualities + chapter spine (not a linear novel).  
- Pipeline roles replace elemental clone ladders as the content spine.  
- TypeScript strict for Kernel; UI may remain JS projectors initially.  
- Vanilla-first UI (no mandatory SPA framework).  
- Content caps: ≤16 pre-prestige modules; ≤20 early inscriptions.  
- Dual write forbidden: all mutations via Kernel commands once wired.  
- Design-tier heal remains; rebound to milestones; not product center.

### Schema / contracts
- Content packages carry schema version.  
- Save snapshots carry schema version + migrate chain.  
- Domain events include at least: `cast`, `crafted`, `faded`, `chapterReached`, `prestigeCommitted`, `affinityLocked`, `tierAdvanced`, `meditationCompleted`.

### Currency naming
Resolve in ticket 01 glossary: keep **AB (Arcane Bits)** externally unless playtests demand “Unbound Magic / Compile Credit” split — do not dual-name in UI without a decision record.

## Testing Decisions

**Good tests** assert external behavior: given commands and time, resources/chapters/prestige outcomes match; saves round-trip; UI shows the primary contract and fade feedback. Avoid brittle private field asserts.

**Must test**
- Kernel tick + fade/storage  
- Craft cost growth monotonic  
- Prestige preview/commit  
- Storylet gating by qualities  
- Migrations  
- Cold e2e arc to prestige teach  
- Privacy of share artifact (existing prior art)  

**Prior art in repo**
- `tests/unit/*` Jest ESM  
- `e2e/*` Playwright  
- `saveCodec` / gameState save tests  
- `captureTheHeal` privacy tests  

**Playtest gate (§8)** required before public “overhaul complete” claims.

## Out of Scope

- Steam as primary milestone  
- Required accounts / cloud-required play  
- Gacha, P2W, third hostage currency, dual quest HUD  
- Realtime multiplayer  
- CSS framework swap for fashion  
- Full cinematic/voice production  
- Worker-thread tick unless profiling forces it (Could ticket)  
- Throwing away all art/audio identity  

## Further Notes

- **Waves** on the map are delivery of the **same destination**, not a permanent reduced product.  
- Capture-the-heal code is an **adapter** to Kernel tier events, not a parallel product.  
- Kill list from campaigns remains except Kernel/content rewrite explicitly allowed.  
- Parent planning: `.scratch/full-overhaul/RALPLAN.md`.  
- Frontier after tickets land: `01` then `02` / `07` docs parallel.  
- Execution: `$ultragoal` / `$team` / `/implement` on frontier tickets only after this publish.
