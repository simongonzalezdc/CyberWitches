# Wayfinder map — Hex Compiler Full Overhaul

**Label:** `wayfinder:map`  
**Tracker:** `.scratch/full-overhaul/`  
**Status:** approved — tickets published under `issues/`  
**SPEC:** `SPEC.md` · **Ralplan:** `RALPLAN.md`

## Destination

Ship **Restoration Kernel**: full experience overhaul — preservation physics, pipeline decisions, chaptered storylets, taught prestige, pure domain Kernel — with design-tier heal as earned ceremony. Done when §8 metrics instrumented + Prestige 1 arc complete end-to-end + rules no longer owned by GameState god-object.

## Notes
- Center: **game design + architecture**, not virality.  
- Vision is **holistic**. Waves deliver the same destination; they are not a reduced product.  
- Forgejo SoT. Capture-the-heal is subsumed as celebration, not the north star.

## Out of scope
Gacha; third hostage currency; dual quest HUD; Steam-first; required accounts; realtime multiplayer.

## Work packages

| # | Title | Blocked by | Lane | Set |
|---|--------|------------|------|-----|
| 01 | Domain Kernel + event taxonomy | — | Kernel | Must |
| 02 | Typed content schema + CI validators | 01 | Kernel | Must |
| 03 | Resource physics: fade + storage | 01,02 | Economy | Must |
| 04 | Pipeline roles content rewrite | 02,03 | Economy | Must |
| 05 | Pure tick + migration engine | 01,03 | Kernel | Must |
| 06 | Save vNext + snapshot codec | 01,05 | Kernel | Must |
| 07 | Chapter spine + storylet engine | 01 | Narrative | Must |
| 08 | Compile contracts (goal rail v2) | 04,07 | Loop | Must |
| 09 | Prestige teach + affinity foreshadow | 04,05,07 | Loop | Must |
| 10 | Specialization strategy paths | 09 | Loop | Must |
| 11 | Meditation v2 first-session + payoff | 09 | Side | Must |
| 12 | Design-tier rebind + ceremony hook | 07,05 | Presentation | Must |
| 13 | Pipeline/HUD IA + a11y | 04,08 | UI | Must |
| 14 | TS strict Kernel + adapters | 01,05 | Tech | Must |
| 15 | Balance battery + property tests | 03–05,09 | QA | Must |
| 16 | Playtest protocol + metrics | 08,09 | QA | Must |
| 17 | Manual + story bible + schema docs | 07–11 | Docs | Must |
| 18 | Legacy content park/deprecate | 04,10 | Economy | Should |
| 19 | Worker tick if perf requires | 05,15 | Tech | Could |
| 20 | Claim-audit full overhaul | Must 01–17 | Gate | Must |

### Waves (one destination)
```
W0 Foundation: 01 → 02 → 05 → 06 → 14
W1 Economy:    03 → 04 → 08
W2 Story+meta: 07 → 09 → 10 → 11
W3 Present:    12 → 13 → 17
W4 Prove:      15 → 16 → 18 → 20
```

**Hard serial spine:** `01 → 02/05 → 03/04 → 07/08/09 → 12/13 → 15/16 → 20`

**Frontier after approval:** 01 Kernel design, 02 schema draft, 07 story bible draft (parallel docs).
