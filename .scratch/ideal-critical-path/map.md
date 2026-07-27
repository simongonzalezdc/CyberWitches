# Wayfinder map — Ideal critical path (heal-moment spine)

**Label:** `wayfinder:map`  
**Tracker:** local-markdown `.scratch/ideal-critical-path/`  
**Tickets:** `/to-tickets` approved — **max parallel edges**  
**Status:** all tickets `ready-for-agent`  
**Spec:** `SPEC.md` · **Ralplan:** `RALPLAN.md` · **Synthesis:** `SYNTHESIS.md`

## Destination

Make Hex Compiler’s **design-tier advance** the primary product moment: observable, audible, capturable, and paced by goals—so first-session competence and niche shareability of the broken→healed thesis are real—without slop. Done when Must tickets are done, CI e2e policy holds, heal+sanitized share exist, claim-audit written.

## Notes

- **Max parallel policy:** Hard blockers only on the event spine **06 → 08 → 12** and claim-audit **16**. Everything else is unblocked or “preferred with” so lanes can start immediately.
- Lanes: **CI** (01,03,04) ‖ **Loop** (02,07,10,11) ‖ **Heal** (06,08,12) ‖ **UX** (05,09,14) ‖ **Growth** (13,15).
- Anti-slop kill list binding 90d (see SPEC / SYNTHESIS).
- Forgejo SoT; no GameState mega-rewrite.

## Decisions so far

- North Star: tier transition as scoreboard + shareable heal (multi-model).
- Ticket breakdown approved with **maximum parallelizability**.
- Hard serial spine only: tier event → heal package → share capture.

## Not yet specified

- Share artifact exact format (PNG vs short clip).
- Exact 30-day share pivot N.
- Stinger: new asset vs retuned stems.

## Out of scope (90d)

Third currency, gacha, pay-power, guilds, CSS framework swap, full GameState rewrite, Steam-before-D1, dual quest HUD, streak-hostage.

## Tickets (index) — parallel-first

| # | Title | Hard blocked by | Lane | Set |
|---|--------|-----------------|------|-----|
| 01 | E2E required in CI | — | CI | Must |
| 02 | Mult-cache invalidation correctness | — | Loop | Must |
| 03 | Dist/prod smoke script | — | CI | Must |
| 04 | Unlock-ratio CI bound | — | CI | Must |
| 05 | Always-on post-tutorial goal stack | — | UX | Must |
| 06 | First-class tier-advance event | — | Heal | Must |
| 07 | Scoped funnel telemetry | — (align names with 06 when ready) | Loop | Should |
| 08 | Heal moment package | **06** | Heal | Must |
| 09 | First-session time-to-automation | — (prefer after 05) | UX | Should |
| 10 | Meditation Δ mult feedback | — (prefer after 02) | Loop | Must |
| 11 | Save outcome UX closeout | — | Loop | Must |
| 12 | Sanitized share/capture at heal | **08** | Heal | Must |
| 13 | Landing thesis + before/after | — (prefer media from 08/12) | Growth | Should |
| 14 | Prestige ceremony + post goals | — (prefer 05+08 language) | UX | Should |
| 15 | Creator seed + growth ops + pivot | — (public push prefer 12+13) | Growth | Should |
| 16 | Map claim-audit | **Must 01–06, 08, 10–12** | Gate | Must |

### Parallel waves (start together inside wave)

```
W0 simultaneous:  01 ‖ 02 ‖ 03 ‖ 04 ‖ 05 ‖ 06 ‖ 07 ‖ 11 ‖ 13 ‖ 14 ‖ 15(docs)
W1 after 06:      08 ‖ 09 ‖ 10
W2 after 08:      12 ‖ (13 media refresh) ‖ (14 polish)
W3 after Must:    16
```

**Frontier (start now — 11 tickets):** 01, 02, 03, 04, 05, 06, 07, 09, 10, 11, 13, 14, 15  

**Only waiters:** 08 (on 06), 12 (on 08), 16 (on Must set).

### Recommended multi-agent assignment

| Agent | Grab immediately |
|-------|------------------|
| A | 01 + 03 + 04 |
| B | 02 + 11 + 07 |
| C | 06 then 08 then 12 |
| D | 05 + 09 + 14 |
| E | 13 + 15 (seed/docs first) |
| Then | 10 with B; 16 last |
