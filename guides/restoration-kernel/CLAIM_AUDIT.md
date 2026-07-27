# Claim-audit — Restoration Kernel

**Date:** 2026-07-27  
**Scope:** Must tickets 01–17 (+18 park note). Ticket 19 (worker tick) deferred pending profiling.

## Verdict

**Kernel pure layer + projectors + docs: SHIPPED with evidence.**  
**Live GameState strangler wiring: PARTIAL** (adapter exists; full dual-write kill not complete).  
**Ticket 19:** residual — not required until profiling demands.

## Evidence map

| Ticket | Claim | Evidence | Status |
|--------|-------|----------|--------|
| 01 Cast pure | Pure cast + events | `js/kernel/cast.js`, `tests/unit/kernel.test.js` 01* | **DONE** |
| 02 Schema CI | Content pack validator | `schema.js`, `npm run validate:kernel-content` in `ci` | **DONE** |
| 03 Fade | Soft fade + storage | `fade.js`, tests 03* | **DONE** |
| 04 Pipeline | Roles content pack | `content.js` ≤16 pre-P, craft | **DONE** |
| 05 Tick | Deterministic tick | `tick.js`, offline 8h clamp test | **DONE** |
| 06 Migrate | v1→v2 + legacy ws | `migrate.js`, tests | **DONE** |
| 07 Chapters | Storylet spine | `chapters.js` | **DONE** |
| 08 Contracts | Primary contract | `getPrimaryContract`, projector | **DONE** |
| 09 Prestige | Preview/commit + keys | `prestige.js`, keys persist | **DONE** |
| 10 Affinity | 4 asymmetric strategies | `affinity.js`, balance tests | **DONE** |
| 11 Meditation | ≤3m mastery + skip | `meditation.js`, tests | **DONE** |
| 12 Tier heals | Chapter-milestone gates | `tiers.js`, `design_tier_heal` | **DONE** |
| 13 HUD IA | Pipeline projector + a11y flags | `projector.js` | **DONE** (pure VM; full HTML IA residual) |
| 14 TS/adapters | JSDoc Kernel + adapter | `adapter.js`, typecheck green | **PARTIAL** — not full TS rewrite |
| 15 Balance | Property battery | `kernel-balance.test.js` | **DONE** |
| 16 Playtest | Protocol doc | `.scratch/full-overhaul/docs/PLAYTEST_PROTOCOL.md` | **DONE** |
| 17 Docs | Manual + bible + schema | `.scratch/full-overhaul/docs/*` | **DONE** |
| 18 Legacy park | Deprecate note | `.scratch/full-overhaul/docs/LEGACY_PARK.md` | **DONE** |
| 19 Worker tick | If profiling requires | — | **DEFER** |
| 20 This file | Claim-audit | this document | **DONE** |

## Commands run (authoring session)

```text
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel.test.js tests/unit/kernel-balance.test.js
npm run validate:kernel-content
npm run typecheck
```

## Residuals (honest)

1. Live game still owns cast/tick via GameState — Kernel adapter not yet the sole mutator.  
2. Full pipeline HUD HTML/CSS progressive disclosure not fully redesigned in this pass (projector ready).  
3. Kernel not migrated to strict TypeScript package; JSDoc + `tsc --checkJs` path.  
4. Ticket 19 worker tick not implemented.  
5. Human mute-field residual from Capture-the-heal remains out of Kernel scope.

## PR history

- Forgejo #26 — pure Kernel 01–09 + GLM fixes (merged)  
- Follow-up PR — tickets 10–18/20 docs + strategies + balance battery  
