# Machine schema — Restoration Kernel

For agents and CI. Content lives in `js/kernel/content.js`; validated by `npm run validate:kernel-content`.

## Commands (`KernelCommand.type`)

| type | payload | effect |
|------|---------|--------|
| `cast` | combo/event/click mults | essence + AB; affinity gain |
| `tick` | `dtSec`, `offline?` | production + fade |
| `craft` | `moduleId`, `amount?` | buy pipeline module |
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

## Caps

- ≤16 pre-prestige modules (validator)  
- Offline tick ≤ 8h  
- Craft amount ≤ 100 per command  

## Soft fade weights (`js/kernel/fade.js`)

- `FADE_WEIGHT: Record<string, number>` — void pressure per inventory key  
- `FADEABLE = Object.keys(FADE_WEIGHT)`  
- `fadeableTotal(inventory)` — **weighted** sum (same units as `storageCap`)  
- Raw essences = `1`; denser craft outputs lower (e.g. `void_crystal` = `0.12`); all non-AB producer outputs must be present (no immortal bank)  
- Early soft: `opts.soft` and low `totalTaps` on prestige 0  

## Save

`version: 2`. `migrateKernelSnapshot` remaps legacy `ws_*` → `mod_*`. Fields: `totalKeys`, `keys`, `affinity`, `chapters`, `contractsCompleted`, `designTier`.
