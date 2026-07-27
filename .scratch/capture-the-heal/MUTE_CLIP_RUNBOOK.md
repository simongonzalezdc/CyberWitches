# Mute-clip stimulus + field runbook (ticket 01)

**Status:** frozen for field use  
**Duration:** 12–15s mute (no VO)  
**Pass rule:** ≥4/5 never-players say system/terminal **restored / healed / fixed / came online**  
**Linked from:** `.scratch/ideal-critical-path/RESEARCH_GAP_CLOSEOUT.md` §1  

---

## Beat list (exact)

| t | Visual | On-screen copy (optional burn-in for captioned variant only) |
|---|--------|--------------------------------------------------------------|
| 0–3s | Tier 0 monochrome shell — no glow, scanline feel | — |
| 3–6s | EXEC cast + compile goal rail visible | — |
| 6–12s | `hex:tierAdvance` ceremony: dim → restore line → chrome → `SYSTEM_RESTORE` toast/log | — |
| 12–15s | `SHARE_RESTORE` full label visible, pulse | — |

**Mute-first:** volume off. No stinger reliance. Optional captions only as a *separate* A/B.

---

## How to capture the stimulus

### Option A — Playwright seed (preferred, reproducible)

```bash
npx playwright test e2e/heal-operator-journeys.spec.js --headed
# Or manual: boot play.html with tutorial dismissed, then in console:
#   uiManager.systems.designTierSystem.emitTierAdvance(0, 1)
# Record the window 0–15s around that emit; ensure SHARE_RESTORE unhidden.
```

Seed flags (already in e2e helpers):

- `hasSeenStoryIntroduction=true`
- `tutorialCompleted=true`
- dismiss story intro / boot screen

### Option B — Manual demo seed (streamer / operator)

1. Fresh profile or clear site data for the game origin.  
2. Open `play.html`, skip story/tutorial.  
3. Wait until compile goal rail is visible.  
4. Use **dev-only** creator seed (see `CREATOR_SEED.md`) *or* progress until first real tier unlock.  
5. Screen-record 15s mute covering Tier 0 → heal → SHARE_RESTORE.

Do **not** ship production cheats on the public path.

---

## Scoring sheet (n=5)

| # | Subject (anon) | Q1 open | Q2 UI change? | Q3 open link? | Q4 one-word | Restored? (Y/N) |
|---|----------------|---------|---------------|---------------|-------------|-----------------|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |
| 4 | | | | | | |
| 5 | | | | | | |

**Questions (order fixed):**

1. What just happened?  
2. Did the UI change? How?  
3. Would you open the link? Why/why not?  
4. One-word description of the game.

**Scoring:**

- **Pass:** ≥4/5 spontaneous *restored/healed/fixed/online* (or equivalent)  
- **Soft pass:** ≥3/5 + “prettier UI / unlocked looks” without restore language  
- **Fail:** majority “numbers” / “don’t know” / only “clicked”

Record results in `FIELD_MUTE_CLIP.md` (ticket 10).

---

## Decision rule (growth)

| Result | Action |
|--------|--------|
| Pass | Visual share spend + community post OK |
| Soft pass | Increase Tier 0 deprivation + ceremony contrast; freeze growth spend |
| Fail | Ceremony redesign blocking; do not market as “heal game” |
