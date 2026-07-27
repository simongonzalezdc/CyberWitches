# 11 — 30-day share pivot re-baseline

**Status:** **clock armed (engineering)**  
**Blocked by:** visual share on main — **done** (PR #20 merged 2026-07-27)  
**N default:** **50** visual/share-attributed attempts (or equivalent operator-defined share events)  

## Filled dates

| Field | Value |
|-------|--------|
| `engineering_start_date` | **2026-07-27** (Forgejo `main` includes SHARE_RESTORE still — PR #20 merge `8aa1847`) |
| `operator_start_date` | **2026-07-27** same day as merge for local/operator counting; **re-set if GH Pages lag** once production URL serves heal still OG |
| `end_date` | **2026-08-26** (engineering_start + 30 days) |
| `N_target` | **50** |
| `N_source` | local funnel `cw.funnel.shareAttempt` samples + any manual share log |

## When the clock starts

| Event | Starts clock? |
|-------|----------------|
| Code merged to Forgejo `main` with SHARE_RESTORE downloading split still | **Yes (engineering)** — armed |
| Production / GH Pages deploy reflecting that main | Operator external N (confirm live OG still) |
| Text-only share (pre-capture campaign) | No — does not count as this baseline |

## If miss (N < 50 or mute-clip fail)

1. **Stop** virality / paid growth spend.  
2. Re-open **noticeability** work (Tier 0 deprivation, ceremony contrast).  
3. Do not expand content economy as a substitute (kill-list / Option B invalidation).  

## If pass

Proceed with creator outreach + optional prestige chapter credits (RALPLAN follow-ups).

## Cross-links

- Claim-audit: `CLAIM_AUDIT.md`  
- Mute field residual: `FIELD_MUTE_CLIP.md` (growth spend still blocked until n=5)  
- Product strategy summary: `PRODUCT_STRATEGY.md` (repo root)  
