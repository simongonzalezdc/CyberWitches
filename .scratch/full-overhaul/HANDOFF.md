# Handoff — Restoration Kernel

**Approved:** 2026-07-27  
**Consensus:** RALPLAN Architect+Critic APPROVE + user approve  
**PRD:** PRD.md  
**Tickets:** issues/00-INDEX.md  

## Status (2026-07-27) — SUPERSEDED BY LIVE SHIP

**Execution complete on `main` / production.** Pure Kernel + live cast/fade adapter + pipeline HUD + quality bar. Authoritative current docs:

- `guides/restoration-kernel/` (CLAIM_AUDIT, QUALITY_*, MANUAL, SCHEMA)
- `CONTEXT.md`, `docs/architecture.md`

This folder remains the **planning archive** (PRD, ralplan, ticket text). Do not re-implement ticket 01 from scratch.

## Historical next-execution notes (pre-ship)

1. ~~`/implement` **01** — Kernel dispatch seam~~ **DONE (#26+)**  
2. ~~Schema / chapters / prestige / affinity~~ **DONE (#26–#30)**  
3. ~~Claim-audit + quality bar~~ **DONE (#33–#34)**  

## Do not
- Implement outside map tickets without updating CLAIM_AUDIT  
- Add gacha / dual HUD / third currency  
- Re-open dual cast/fade writers outside `js/kernel/adapter.js`  
