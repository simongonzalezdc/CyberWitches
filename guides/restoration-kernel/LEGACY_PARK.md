# Legacy content — parked / deprecate

Ticket 18. Elemental clone ladders and dual-objective quest rails are **parked** in favor of pipeline roles.

## Parked patterns

- Parallel fire/water/air/crystal **identical** producer ladders without role differentiation  
- Dual primary quest HUD (daily + contract competing as equal rails)  
- AB-only design-tier gates without chapter milestones  
- Prestige as pure mult table with no affinity strategy  
- **Immortal intermediate banks** (crafted goods that never take fade pressure)  
- Generic “preservation chamber / perfect harmony / transcendence through code” copy  
- Generic cyan glassmorphism UI (use hex lattice instrument deck instead)  
- Dual-count of the same station as both `ws_*` and `mod_*` in role totals or production  

## Mapping

Legacy `ws_*` ids map into Kernel `mod_*` via `mapsFrom` / `LEGACY_TO_MODULE`.  
Live ownership **canonical** prefers `ws_*` for paired stations (`applyOwnershipDelta`, `coalesceWorkstations`).

## Current ownership (live truth)

| Path | Owner |
|------|--------|
| Cast resources | Kernel `castOnGameState` |
| Soft fade (tick + offline) | Kernel `fadeOnGameState` + full `FADE_WEIGHT` ladder |
| Ownership bag | `coalesceWorkstations` — SUM pairs; craft writes canonical |
| Workstation craft / buy list | Live `PRODUCERS` (`ws_*`) with **pipeline roles** |
| Production tick | Coalesced bag × PRODUCERS rates + kernel-only module outputs |
| Meditation mastery mult | Kernel → `specializationBonuses.productionMult` |
| Surface chrome (post T0) | `css/aesthetic-v2.css` |

## Dual-graph note (Overall S+ O2)

The buy list and Kernel content pack are still two content tables, but **runtime ownership is single-bag**. Systems S+ does **not** require deleting `PRODUCERS`; it requires no dual-count and canonical writes (shipped PR #58).

## Do not

- Reintroduce gacha / third hostage currency  
- Ship Steam before Day-1 browser arc is solid  
- Re-open dual **cast/fade** writers outside the Kernel adapter  
- Raise notification `maxVisible` without a visual regression check  
- Treat Capture-the-heal **human** field pilot as a Kernel engineering residual  
- Add producer outputs without a `FADE_WEIGHT` entry  
- Write craft purchases to both `ws_*` and `mod_*` for the same station without coalesce  
