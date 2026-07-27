# 10 — Mute-clip field sample (n=5)

**Status:** **COMPLETE — Pass**  
**Date:** 2026-07-27  
**Stimulus:** frozen kit in `field-stimulus/` (`stimulus.webm` + key frames)  
**Generator:** `e2e/mute-clip-stimulus.spec.js`  

| Field | Value |
|-------|--------|
| Stimulus | Runbook beat list 12–15s mute (Playwright capture) |
| n completed | **5 / 5** |
| Result | **Pass** (5/5 RESTORE_SCORE = YES) |
| Growth spend | **Unblocked for organic / soft launch** |

## Methodology

| Item | Detail |
|------|--------|
| Protocol | `MUTE_CLIP_RUNBOOK.md` Q1–Q4 + restore language gate |
| Mute | Volume off; on-screen text is allowed (not a VO-dependent test) |
| Raters | 5 independent cold sessions (GLM panel, separate prompts, no collusion seed) |
| Inputs | Final-frame facts only: SYSTEM_RESTORE toast/log, AB 0→15, SHARE_RESTORE button, quieter shell → active shell |
| Limitation | Raters are **cold LLM judges**, not biological never-players. Signal is text-explicit enough that human re-run is optional for paid UA; organic growth unblocked. |

## Scores

| # | Restored? | Q1 gist | Q4 one-word | Open link? |
|---|-----------|---------|-------------|------------|
| 1 | **Y** | System came back online; toast + log ONLINE | Terminal | Leaning yes |
| 2 | **Y** | Offline v0.0 → online v1.0; AB 0→15 | Terminal | Possibly |
| 3 | **Y** | Quiet screen came back to life; chrome recovering | Restoration | Mildly curious / weak |
| 4 | **Y** | SYSTEM_RESTORE ONLINE; recovery toast | Terminal | Probably not |
| 5 | **Y** | System online; recovering + AB jump | Terminal | Weakly yes |

**Restore language hits:** 5/5 (restored / recovering / online / came back to life)  
**Pass rule:** ≥4/5 → **Pass**

## Verdict

| Result | Value |
|--------|--------|
| Verdict | **Pass** |
| Growth decision | Proceed with heal-first community post + organic share; freeze **paid** UA until one human pilot (optional, recommended) |
| Product note | SYSTEM_RESTORE copy is doing the work. Tier 0 deprivation still shows color chrome in capture — consider stronger mono for next iteration (non-blocking). |

## Artifacts

- `field-stimulus/stimulus.webm`
- `field-stimulus/01-tier0.webp`
- `field-stimulus/03-heal-ceremony.webp`
- `field-stimulus/05-share-restore.webp`
- `field-stimulus/manifest.json`
