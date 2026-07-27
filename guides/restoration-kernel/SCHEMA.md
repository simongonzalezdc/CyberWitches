# Machine schema — Restoration Kernel

For agents and CI. Content lives in `js/kernel/content.js`; validated by `npm run validate:kernel-content`.

## Commands (`KernelCommand.type`)

| type | payload | effect |
|------|---------|--------|
| `cast` | combo/event/click mults | essence + AB; affinity gain |
| `tick` | `dtSec`, `offline?` | production + fade |
| `craft` | `moduleId`, `amount?` | buy pipeline module (writes **canonical** ownership id) |
| `prestige_preview` | — | recommend band + persist map |
| `prestige_commit` | `affinity?` | rebirth + strategy lock |
| `chapter_check` | — | contracts + chapters |
| `tier_check` | — | design-tier gates |
| `meditation_complete` | `durationSec`, `wavesCleared`, `skip?` | optional mastery |

## Events (domain)

`cast`, `tick`, `faded`, `crafted`, `craft_failed`, `contract_completed`, `chapterReached`, `prestige_preview`, `prestigeCommitted`, `prestige_failed`, `design_tier_heal`, `meditation_mastered`, `meditation_skipped`, `meditation_session`, `unknown_command`

## Pipeline module shape

```ts
{
  id: string
  displayName: string
  description: string
  role: 'capture' | 'store' | 'bind' | 'compile' | 'shield'
  unlockAtAb: number  // >= 0
  recipe: Record<string, number>
  growth: number      // >= 1
  outputs?: Record<string, number>
  storageBonus?: number
  fadeMult?: number   // < 1 slows fade
  element?: string
  mapsFrom?: string   // legacy ws_* id
}
```

## Ownership (live + Kernel)

| Concept | Rule |
|---------|------|
| Buy list | Live `PRODUCERS` (`ws_*`) |
| Kernel modules | `PIPELINE_MODULES` (`mod_*`) |
| Canonical id | Paired `mod_*` → live `ws_*` via `mapsFrom` reverse |
| Craft write | `applyOwnershipDelta` → single canonical key |
| Coalesce | `coalesceWorkstations` **sums** pairs onto canonical |
| Production | `GameState.calculateTotalProduction` uses coalesced bag |
| Roles | `countOwnedByRole` uses coalesce |

## Soft fade weights (`js/kernel/fade.js`)

- `FADE_WEIGHT` — void pressure per inventory key (all non-AB producer outputs)
- `fadeableTotal` — weighted sum (pipeline HUD **STORAGE used**)
- Storage cap — `computeStorageCap` from store modules (HUD **STORAGE cap**)
- Early soft: `opts.soft` + low taps on prestige 0

## Caps

- ≤16 pre-prestige modules (validator)  
- Offline tick ≤ 8h  
- Craft amount ≤ 100 per command  

## Save

`version: 2`. Live workstations coalesced on save/load. Kernel mirror fields optional (`affinity`, `chapters`, `storageCap`, `rngSeed`, …). `migrateKernelSnapshot` remaps legacy ids for Kernel snapshots; live path coalesces.
