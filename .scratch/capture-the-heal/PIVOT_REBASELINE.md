# 11 — 30-day share pivot re-baseline

**Blocked by:** visual share on main (ticket 06 merged)  
**N default:** **50** visual/share-attributed attempts (or equivalent operator-defined share events)  
**Clock start:** date visual SHARE_RESTORE (still) ships on **main** / production deploy  

## When the clock starts

| Event | Starts clock? |
|-------|----------------|
| Code merged to Forgejo `main` with SHARE_RESTORE downloading split still | Yes (engineering) |
| Production / GH Pages deploy reflecting that main | **Operator start date** for external N |
| Text-only share (pre-capture campaign) | No — does not count as this baseline |

**Fill after merge:**

- `start_date:` _YYYY-MM-DD (deploy)_  
- `end_date:` start + 30 days  
- `N_target:` 50  
- `N_source:` local funnel `cw.funnel.shareAttempt` samples + any manual share log  

## If miss (N < 50 or mute-clip fail)

1. **Stop** virality / paid growth spend.  
2. Re-open **noticeability** work (Tier 0 deprivation, ceremony contrast).  
3. Do not expand content economy as a substitute (kill-list / Option B invalidation).  

## If pass

Proceed with creator outreach + optional prestige chapter credits (RALPLAN follow-ups).
