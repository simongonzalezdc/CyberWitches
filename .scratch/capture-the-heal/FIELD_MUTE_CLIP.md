# 10 — Mute-clip field sample

## Pass 1 — cold LLM panel (complete)

**Date:** 2026-07-27  
**Status:** complete · **Pass** (5/5 restore language)  
**Limitation:** cold LLM judges, not biological never-players · pre-polish stimulus  

| Field | Value |
|-------|--------|
| n | 5/5 |
| Restore language | 5/5 YES |
| Open-link intent | weak (3/5 lukewarm–negative) — warning signal |
| Growth | Organic OK under text-comprehension; **not** paid-UA proof |

---

## Pass 2 — human never-players (run this week)

**Status:** **READY — not yet run**  
**Stimulus:** `field-stimulus/` regenerated **after** adversarial polish (mono T0, gated chrome, single toast, persistent SHARE)  
**Generator:** `e2e/mute-clip-stimulus.spec.js`  
**Full protocol:** `MUTE_CLIP_RUNBOOK.md`  

### Setup (15 min)

1. Regenerate if needed: `npx playwright test e2e/mute-clip-stimulus.spec.js`  
2. Export `field-stimulus/stimulus.webm` **or** screen-record production with volume off  
3. Recruit 5 people who have **never** played Hex Compiler (not idle specialists)  
4. Phone or laptop, **volume off**, one play, no rewind, no commentary  

### Questions (order fixed)

1. What just happened?  
2. Did the UI change? How?  
3. Would you open the link? Why/why not?  
4. One-word description of the game.

### Scoring sheet

| # | Anon | Q1 open | Q2 UI change? | Q3 open link? (Y/N/maybe) | Q4 one-word | Restore? (Y/N) |
|---|------|---------|---------------|---------------------------|-------------|----------------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

### Gates (both required for paid UA)

| Gate | Pass rule |
|------|-----------|
| **Restore language** | ≥4/5 spontaneous restored / healed / fixed / came online / recovered |
| **Intent** | ≥3/5 yes or probably on “would you open the link” |

| Result | Action |
|--------|--------|
| Both pass | Community post + creator DMs + light organic; paid UA only if you want |
| Restore pass, intent fail | Soft pass — increase contrast / first-frame punch; **no paid UA** |
| Restore fail | Fail — ceremony/clip redesign; freeze growth spend |

### Decision log (fill after run)

| Field | Value |
|-------|--------|
| Date run | |
| Stimulus used | `field-stimulus/stimulus.webm` / other: |
| Restore score | _ / 5 |
| Intent score | _ / 5 |
| Verdict | Pass / Soft pass / Fail |
| Growth decision | |

---

## Artifacts

- `field-stimulus/manifest.json`  
- `field-stimulus/01-tier0.webp`  
- `field-stimulus/03-heal-ceremony.webp`  
- `field-stimulus/05-share-restore.webp`  
- `field-stimulus/stimulus.webm` (if generated)  
- Operator pack: `VIRAL_POST_PACK.md`
