# Legacy content — parked / deprecate

Ticket 18. Elemental clone ladders and dual-objective quest rails are **parked** in favor of pipeline roles.

## Parked patterns

- Parallel fire/water/air/crystal **identical** producer ladders without role differentiation  
- Dual primary quest HUD (daily + contract competing as equal rails)  
- AB-only design-tier gates without chapter milestones  
- Prestige as pure mult table with no affinity strategy  

## Mapping

Legacy `ws_*` ids map into Kernel `mod_*` via `mapsFrom` / `LEGACY_TO_MODULE` in `js/kernel/content.js`.

## Do not

- Reintroduce gacha / third hostage currency  
- Ship Steam before Day-1 browser arc is solid  
- Rewrite GameState as permanent dual-write owner once Kernel is wired  
