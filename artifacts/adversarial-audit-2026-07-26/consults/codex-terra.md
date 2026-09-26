# Codex Terra consult (final section)

## Verdict

Hex Compiler has a strong premise buried under an overbuilt hobby-project shell. The actual game is “click EXEC, read dense cards, wait for recipes,” while the marketing promises a rare, evolving magic-restoration experience it barely dramatizes. The interface is technically polished in spots but visually generic cyber-terminal, the copy explains instead of seduces, and the codebase has centralized too many unrelated responsibilities into a few dangerous files.

## Top 10 must-fix (P0/P1) with rationale

1. **P0 — Make the first 10 minutes tell a story, not teach a spreadsheet.** The opening state presents several dense, disabled-looking workstation cards and a cryptic `EXEC` button. Give the player one immediate, named objective, one visible transformation, and a first craft inside a minute.

2. **P0 — Deliver the Tier 0–4 promise visibly.** The design contract says Tier 0 is monochrome and broken; the zero-progress capture is already cyan-heavy, orderly, and lavishly framed. If restoration is the USP, Tier 0 must feel materially constrained and every tier must restore a specific capability the player notices.

3. **P0 — Delete or radically simplify the manual-click grind.** The documented 0.1 AB per cast makes early thresholds psychologically absurd without opaque achievement windfalls. Manual casting needs rhythm, choices, and immediate conversion—not repetitive labor before automation.

4. **P0 — Reframe the game around one readable economy.** “AB,” five+ ingredients, workstations, inscriptions, experiments, keys, boons, rituals, focus, and meditation arrive as a taxonomy before they become play. Lock secondary systems behind demonstrated need and explain costs in player-language.

5. **P1 — Either make meditation central or cut it.** Tower defense is a second game with separate resources, upgrades, canvas controls, and a different cognitive mode. It currently reads as feature accumulation, not a natural expression of compiling fading magic.

6. **P1 — Repair the landing page’s proof failure.** The supplied landing verification capture shows empty screenshot cards. A public game page cannot advertise visual evolution and then display blank evidence panels.

7. **P1 — Replace UI prose cards with decision information.** Workstation descriptions such as “a digital preservation chamber that compiles Fire essence into stable data structures” make every card look AI-written and hide the only decision-relevant facts: output, bottleneck, payoff, and next unlock.

8. **P1 — Break up the god modules before new content.** `js/audioSystem.js` is 3,904 lines; `gameState.js` owns simulation, production, prestige, saves, migrations, conflict merging, and offline rewards in 1,614 lines. These are regression factories, not modules.

9. **P1 — Stop claiming cross-device capability.** Product strategy markets cloud saves/cross-device play, but the shipped persistence is localStorage mirrored to IndexedDB. That is durable local storage, not sync; the claim destroys trust when a player changes devices.

10. **P1 — Replace static “quality” documentation with release truth.** `FUTURE_DEVELOPMENT.md` says E2E testing still needs to be implemented despite Playwright suites already existing. The manual also names controls and systems that do not match the current shell. Stale docs make the product feel abandoned.

## Top 10 opportunities (not bugs — leverage)

1. Make every Tier unlock restore one sense: readable language, color, sound, motion, then music.
2. Turn casting into compilation: assemble short hex fragments, resolve them, then automate the compiler.
3. Make failed experiments reveal partial lore or a permanent research trace; failure should produce curiosity, not only loss.
4. Give each elemental specialization a genuinely different interface behavior, not merely multipliers.
5. Use the system log as an authored narrator with short, reactive lines.
6. Make prestige a deliberate archival sacrifice: choose what magic survives the reset.
7. Let the “terminal” become less terminal-like over time—eventually reveal a strange, living magical instrument.
8. Convert daily rituals from generic chores into anomalies appearing in the corrupted archive.
9. Use achievements as discoveries with artifacts, not a checklist of numerical thresholds.
10. Publish one striking 20-second GIF showing Tier 0 becoming Tier 4; it sells the actual differentiator better than feature lists.

## Aesthetic direction

Keep the near-black field, cyan-as-data / magenta-as-corruption contrast, and centered cast ritual. Kill the generic glass cards, repeated neon borders, terminal-path tab names, and card-grid marketing rhythm. Invent a “damaged archive becoming a living compiler” language: imperfect glyph blocks, unstable typesetting, encoded flora/crystal logic, and progressive materiality. The late game should not merely become brighter; it should become less like a dashboard.

Mobile currently preserves the cast deck, but the long vertical stack of nearly identical workstation cards makes it feel like an admin list. Collapse unavailable recipes, surface one recommended action, and reserve full card detail for intentional expansion.

## Copy direction

Rules:

- Write what changes for the player, not what the object vaguely represents.
- Use one concrete magical-computational image per surface; do not stack “digital / preservation / stable data / entropy.”
- Terminal language is for status and action. Narrative language is for discoveries. Marketing language should be almost absent.
- Never use “unlock,” “discover,” “power,” “journey,” or “fading magic” as empty filler.
- Replace labels such as `/MNT/WORKSTATIONS` when they obscure rather than orient.

Worst offenders include:

- “A digital preservation chamber that compiles Fire essence into stable data structures.”
- “Every forge you program is a small victory against entropy.”
- The landing’s repeated feature explanations and technology-chip section.
- Generic system labels like `RESOURCE_MONITOR`, `SYSTEM_LOG`, and `RUN_PROTOCOL` where plain-language orientation would be clearer.

## Blind spots

- No evidence of live balance telemetry, churn analysis, or a tested first-prestige funnel.
- The Tier system may create accessibility problems if critical readability or feedback is withheld as a reward.
- Daily chores, combos, random events, achievements, prestige, and meditation may compete for attention instead of forming one retention cadence.
- The persistence path handles corruption carefully, but multi-device expectations are unsolved.
- Existing browser tests validate bootability and basic interactions, not whether progression is understandable, fun, or economically sane.
- The code still carries archived/dead coven references and commented persistence hooks, suggesting product scope has not been pruned decisively.

