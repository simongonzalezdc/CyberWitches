# Wayfinder map — Capture the heal

**Label:** `wayfinder:map`  
**Tracker:** local-markdown `.scratch/capture-the-heal/`  
**Status:** **shipped + residuals closed** (PR #20; field Pass; OG live 2026-07-27)  
**Prior campaign:** ideal-critical-path (shipped #14–#19)  
**Research:** `../ideal-critical-path/RESEARCH_GAP_CLOSEOUT.md`  
**Ralplan:** `RALPLAN.md`  
**Merged:** https://git.kyanitelabs.tech/simon/CyberWitches/pulls/20  
**Claim-audit:** `CLAIM_AUDIT.md` · **Pivot:** `PIVOT_REBASELINE.md`

## Destination

Ship **Capture the heal**: mute-readable heal **ceremony** + **visual share artifact** (split still; optional short loop) + **instrumented TTA/TTH**, so a stranger can understand “the system restored” from one still or 15s clip — then re-run the 30-day share pivot with real visual share. Done when Must tickets are complete, mute-clip protocol is runnable with a frozen stimulus, and claim-audit for this map exists.

**Engineering destination: met on main.** Field n=5 + N=50 pivot still open for growth.

## Notes

- Domain: product force-multiplier (capture), not content expansion.
- Kill list 90d binding (see Out of scope).
- Max parallel: hard serial only ceremony → visual capture → SHARE wire; field mute-clip after stimulus; instrumentation parallel.
- Chart is **plan**; execution only after explicit approval (`/to-tickets` + implement).
- Forgejo SoT; no GameState mega-rewrite.

## Decisions so far

- Prior map [Ideal critical path](../ideal-critical-path/map.md) **shipped** (heal spine on main).
- [Research gap closeout](../ideal-critical-path/RESEARCH_GAP_CLOSEOUT.md) — cyber-idle skins oversupplied; UI-state scoreboard undersupplied; mute-clip protocol ready.
- Visual 100 (SHARE_RESTORE label) is polish, **not** viral visual artifact.
- **Campaign shape (RALPLAN Option A):** Capture the heal — ADR in `RALPLAN.md`.

## Not yet specified

- Exact pixel tokens of split card (after format ticket).
- GIF vs WebM vs still-only for v1 loop.
- Named creator outreach list.

## Out of scope (this effort)

Third currency; gacha; pay-power; streak-hostage; dual quest HUD; CSS framework swap; GameState rewrite; Steam-before-D1; full meditation re-arch; multi-prestige depth; paid UA.

## Tickets (index)

| # | Title | Type | Hard blocked by | Lane | Set |
|---|--------|------|-----------------|------|-----|
| 01 | Freeze mute-clip stimulus + field runbook | task | — | Growth | Must |
| 02 | Instrument TTA / TTH / share funnel (local) | task | — | Loop | Must |
| 03 | Decide visual share format (still vs still+loop) | research | — | Heal | Must |
| 04 | Heal ceremony state machine (timeline + reduced-motion) | task | — | Heal | Must |
| 05 | Split before/after capture pipeline (sanitized) | task | **03**, **04** | Heal | Must |
| 06 | Wire SHARE_RESTORE to visual artifact (≤2 actions) | task | **05** | Heal | Must |
| 07 | Landing / OG use real heal still | task | **05** | Growth | Should |
| 08 | Creator seed path that can trigger heal on stream | task | **04** | Growth | Should |
| 09 | Community post checklist (heal-first screenshot) | task | — | Growth | Should |
| 10 | Mute-clip field sample (n=5) + score | task | **01**, prefer **05** | Growth | Must |
| 11 | 30-day pivot re-baseline after visual share ships | task | **06** | Growth | Must |
| 12 | Claim-audit for Capture the heal map | task | **Must 01–06, 10** | Gate | Must |

### Parallel waves

```
W0 parallel:  01 ‖ 02 ‖ 03 ‖ 09
W1:           04 (default still-first if 03 not locked)
W2 after 04:  05 ‖ 08
W3 after 05:  06 ‖ 07 ‖ 10
W4 after 06:  11
W5 after Must: 12
```

**Hard serial spine:** `03+04 → 05 → 06`. Field test `10` needs `01` + prefers `05`.

**Frontier after execution approval:** 01, 02, 03, 09, 04.

### Multi-agent assignment (post-approval)

| Agent | Grab |
|-------|------|
| A | 02 instrumentation |
| B | 03 + 04 ceremony |
| C | 05 capture → 06 wire |
| D | 01 / 09 / 10 growth + field |
| Then | 07, 08, 11, 12 |
