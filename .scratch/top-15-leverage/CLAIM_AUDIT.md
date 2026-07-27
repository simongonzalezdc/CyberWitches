# Claim audit — top-15 leverage map

**Date:** 2026-07-27  
**Branch:** fix/top-15-leverage  

| Ticket | Claim | Evidence |
|--------|--------|----------|
| 01 backup twin | removed from live js/ | no js/gameState.js.backup |
| 02 tier e2e | progression e2e | e2e/progression-tier.spec.js |
| 03 meditation smoke | e2e mult check | same file, second test |
| 04 boot dismiss | shared helper | e2e/helpers/dismissOverlays.js + smoke import |
| 05 questSystem | archived | js/archive/questSystem.js; live path gone |
| 06 economy 25× | unlock retune max jump <5 | producers.js unlockAtAb; unit test |
| 07 design-tier truth | notifyTierProgress | designTierSystem.js |
| 08 potion display | catalog + inventory | potionCatalog.js; inventoryUI |
| 09 stats HUD | bridges from prior PR | window.achievements/combo/meditationState |
| 10 Forgejo SoT | docs | AGENTS.md + README.md |
| 11 gameState seam | potion catalog extract | getPotionEffectDef |
| 12 audio seam | shouldAllowSfx in playSound | audioSystem.js + musicPolicy |
| 13 secondary gaps | same retune as 06 | max ratio <5 |
| 14 half-wired | quest archived | residual: none player-path required |
| 15 this file | claim audit | .scratch/top-15-leverage/CLAIM_AUDIT.md |

## Residual
- Playwright e2e must be run with browsers installed for full gate
- Further gameState/audio splits remain multi-PR
