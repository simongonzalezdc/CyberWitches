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

## Mapping

Legacy `ws_*` ids map into Kernel `mod_*` via `mapsFrom` / `LEGACY_TO_MODULE` in `js/kernel/content.js`.

## Current ownership (not “parked” — live truth)

| Path | Owner |
|------|--------|
| Cast resources | Kernel `castOnGameState` |
| Soft fade (tick + offline) | Kernel `fadeOnGameState` + full `FADE_WEIGHT` ladder |
| Workstation craft / buy list | Live `PRODUCERS` (`ws_*`) with **pipeline roles** |
| Meditation mastery mult | Kernel → `specializationBonuses.productionMult` |
| Surface chrome (post T0) | `css/aesthetic-v2.css` |

## Do not

- Reintroduce gacha / third hostage currency  
- Ship Steam before Day-1 browser arc is solid  
- Re-open dual **cast/fade** writers outside the Kernel adapter  
- Raise notification `maxVisible` without a visual regression check  
- Treat Capture-the-heal **human** field pilot as a Kernel engineering residual  
- Add producer outputs without a `FADE_WEIGHT` entry (CI/unit tests pin late-tier fade)
