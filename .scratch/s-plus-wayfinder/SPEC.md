# Spec: Overall S+ for Hex Compiler (O2)

**Status:** ready to publish  
**Parent waymap:** https://git.kyanitelabs.tech/simon/CyberWitches/issues/40  
**Bar lock:** O2 — overall S+ requires Eng ∩ Product ∩ Systems ∩ Identity  
**Version target:** v1.1.x → stamp on tip after all gates pass  

## Problem Statement

Hex Compiler ships a strong Restoration Kernel (cast, weighted soft fade, pipeline roles, aesthetic v2) and can claim engineering S+ under the existing Q1–Q8 bar when evidence is fresh. It cannot honestly claim overall S+: visual evidence is stale after aesthetic-v2; players can ignore prestige recommend and grind void; Store/fade pressure is under-communicated in the HUD; and the dual craft graph (live workstations vs Kernel pipeline modules) blocks a true Systems S+. The player/operator experience is very good A with known structural debt, not a complete S+ product.

## Solution

Deliver a falsifiable overall S+ stamp by:

1. Re-proving engineering Q1–Q8 on the current tip (especially visual + canary).
2. Making product verbs legible: prestige ascent band and weighted storage/void pressure.
3. Strangling the dual craft graph into a single ownership/production truth so Systems can grade S+.
4. Closing identity gates (visual multi-surface score, anti-cliché copy policy).
5. Extending QUALITY_BAR / QUALITY_REPORT so overall S+ is a checklist of blocks, not vibes.

Ship as small vertical slices; stop when the bar passes. Mute-clip field pilot and paid UA remain out of scope.

## User Stories

1. As a player, I want unstored stock to fade in a way I can see, so that building Store modules feels necessary after the tutorial.
2. As a player, I want compiled intermediates to still risk the void (slower than raw), so that banking denser packets does not delete the game pressure.
3. As a player, I want a clear storage used/capacity readout in weighted void-pressure units, so that I understand overcap before stock disappears.
4. As a player, I want overcap to produce a short diegetic signal (without toast spam), so that void loss is noticed without opening a manual.
5. As a player, I want the pipeline strip (Capture to Store to Bind to Compile to Shield) to match what I actually own, so that the HUD never lies.
6. As a player, I want EXEC cast and idle production to feel like one system, so that I am not playing two half-games.
7. As a player, I want workstations I craft to be the same entities that produce and that prestige resets, so that progress is legible.
8. As a player, I want prestige recommend to appear when Keys are worth more than more grind, so that ascent is a clear decision.
9. As a player, I want the game to discourage endless void grind before first prestige, so that the first rebirth is not skipped by habit.
10. As a player, I want affinity strategies after prestige to change how the pipeline plays, so that rebirth is not only plus-percent numbers.
11. As a player, I want early minutes soft on fade, so that I can learn without being punished immediately.
12. As a player, I want offline catch-up fair (capped, soft fade), so that closing the tab is not catastrophic or exploitative.
13. As a player, I want design-tier heal and SHARE_RESTORE to remain mute-readable, so that the restoration fantasy stays intact.
14. As a player, I want at most two toasts visible, so that the workstation board stays readable during achievement bursts.
15. As a player, I want the hex lattice aesthetic after tier-0, so that the UI feels like a sector terminal, not generic dark SaaS.
16. As a player, I want tier-0 to stay monochrome and calm, so that the boot story still works.
17. As a player, I want first-run story CTAs to meet contrast standards, so that Begin is readable and accessible.
18. As a player, I want prestige and meditation surfaces to share the same visual language as the board, so that the product feels one piece.
19. As a player, I want workstation descriptions to sound like sector compile work, so that copy does not feel AI-slop idle.
20. As a player, I want display names that encode job, not only Quantum/Void templates, so that mid/late tiers stay diegetic when rename policy is on.
21. As an operator, I want Q1 through Q8 re-runnable on tip, so that S+ claims are not stale artifacts.
22. As an operator, I want a visual VERDICT after aesthetic changes, so that re-skins cannot silently drop the bar.
23. As an operator, I want production canary HEALTHY with pipeline HUD live, so that deploy lag is not mistaken for code success.
24. As an operator, I want playtest-kernel to encode prestige-before-void policy checks, so that pacing regressions fail scripts.
25. As an agent implementer, I want a single ownership id space (or strangler with clear sole path), so that features do not dual-write.
26. As an agent implementer, I want save migration for workstation ids, so that existing players do not brick.
27. As an agent implementer, I want FADE_WEIGHT coverage for every non-AB craft output, so that immortal banks cannot return.
28. As an agent implementer, I want QUALITY_BAR to list Eng/Product/Systems/Identity blocks, so that overall S+ is mechanical.
29. As a designer, I want dual-graph accept path documented as insufficient for overall S+, so that A-cap is not sold as S+.
30. As a designer, I want banned cliché phrases prevented or linted, so that copy does not regress.
31. As a QA, I want e2e void-save and smoke green on main, so that Kernel sole paths stay live.
32. As a QA, I want axe contrast on first-run story green, so that aesthetic overrides cannot break a11y.
33. As a player on mobile, I want SHARE label readable at about 320px, so that heal share works on phone.
34. As a prestiging player, I want preview of what persists vs resets, so that ascent is not a blind reset.
35. As a returning player, I want my save to load after Systems strangler, so that migration is invisible and correct.
36. As a completionist, I want overall S+ stamped in QUALITY_REPORT with tip commit, so that done is public and checkable.

## Implementation Decisions

### Bar composition (locked O2)

- Overall S+ = Eng Q1-Q8 intersect Product intersect Systems intersect Identity.
- Mute-clip / paid UA pilot is not required for overall S+.
- Accepting dual-graph forever cannot claim overall S+ (Systems max A only).

### Seams (primary)

Prefer existing Kernel pure seams; minimize new surface area.

1. Primary product/economy seam — Kernel pure dispatch (fade, tick, prestige, craft, projectors). Economy policy lands here first.
2. Live bridge seam — Kernel adapter to GameState. Sole path for cast/fade today; expands when production/ownership unify.
3. Pipeline role seam — role map plus HUD projector. Q8 (28/28 mapped, exact counts) stays hard every slice.
4. Quality evidence seam — scripts, QUALITY_BAR/REPORT, visual VERDICT, canary. No grade without tip-dated artifacts.
5. UI presentation seam — pipeline HUD, resource monitor, aesthetic-v2. Weighted storage and prestige interrupt live here; toast max 2 stays law.

### Systems strangler (O2)

- Expand: canonical ownership projection without deleting live ladder.
- Migrate: production and craft sole-path; save remaps legacy ids.
- Contract: remove dual writers/counters; playtest + e2e prove single path.
- Preference: strangler (hybrid then full single truth) over big-bang unless dual-graph ticket locks pure big-bang.

### Product defaults (if remaining grills unresolved)

- Prestige: soft storylet when recommend band and mid-ladder AB; sim gate at least 4 of 5 sessions surface recommend before void unlock AB.
- Store UX: weighted used/cap in HUD and Store chip; no toast spam.
- Visual: re-prove at least 95; stretch 98 if identity requires; multi-surface checklist.

### Content / identity

- Anti-cliché voice retained (sector, packet, void weight).
- Display rename optional; banned-phrase lint if identity requires.

### Save

- Prefer snapshot compatibility; if id migration needs version bump, explicit migrate and round-trip tests. No forced prestige wipe.

## Testing Decisions

- Test external behavior: fade overcap, prestige band, role counts, migration load, HUD readiness, a11y contrast — not private helpers.
- Prefer pure Kernel unit tests for economy law.
- Prefer playtest-kernel-sim for multi-session pacing proxies.
- Prefer Playwright for void-save, smoke, heal/a11y, visual capture.
- Good tests fail when Store dies, dual counts diverge, prestige recommend never fires before void unlock, or visual/a11y regresses after CSS.
- Prior art: kernel unit suite, playtest-kernel-sim, kernel-void-save e2e, a11y-axe, notification maxVisible tests.

## Out of Scope

- Paid UA, ad spend, mute-clip human pilot
- Steam, multiplayer, new minigames
- Full meditation TD rewrite
- Infinite polish after visual score gate
- Claiming overall S+ while dual-graph remains sole architecture
- Unrelated refactors outside Kernel/live craft/HUD/quality evidence

## Further Notes

- Waymap: https://git.kyanitelabs.tech/simon/CyberWitches/issues/40
- Research: Q5 STALE; recommend about 150 AB; void unlocks 400k+
- Ralplan: .scratch/s-plus-wayfinder/S_PLUS_RALPLAN.md
- Domain vocab: EXEC, soft fade, FADE_WEIGHT, storageCap weighted, pipeline roles, affinity, design-tier heal, SHARE_RESTORE, Arcane Bits, Eldritch Keys
