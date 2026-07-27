# Viral post pack — Capture the heal (operator one-pager)

**Date:** 2026-07-27  
**Play URL:** https://simongonzalezdc.github.io/CyberWitches/play.html  
**Landing:** https://simongonzalezdc.github.io/CyberWitches/  
**Thesis:** The UI is the scoreboard — broken terminal chrome heals as you preserve magic.  
**Stimulus kit:** `field-stimulus/` (regenerated post adversarial polish)

---

## 1. Mute clip (12–15s) — freeze and reuse

| t | Must show |
|---|-----------|
| 0–3s | Hard mono Tier 0 (deprived chrome) |
| 3–6s | EXEC cast + compile goal rail |
| 6–12s | Real heal cut → `SYSTEM_RESTORE` toast + log |
| 12–15s | Full `SHARE_RESTORE` label |

**Rules:** volume off in the final export. No VO. Optional captions only as a separate A/B.

**Record:**
```bash
npx playwright test e2e/mute-clip-stimulus.spec.js
# or screen-record production play.html with creator seed (CREATOR_SEED.md)
```

---

## 2. Captions (pick one)

**A — Thesis**
> Browser idle where the UI itself is the scoreboard. Broken terminal → SYSTEM_RESTORE. Mute it first. Free: [play link]

**B — Feedback Friday**
> Feedback Friday: Hex Compiler. Looking for cold takes on the **heal** moment (not ABPS). Did “system restored” land? [play link]

**C — Soft launch**
> Soft launch. Idle loop + progressive terminal chrome. Share is a sanitized heal still (no full save). Cold eyes welcome: [play link]

**Pinned first comment (if platform allows)**
> Tip: watch with sound off. The whole point is mute-readable restore.

---

## 3. r/incremental_games checklist

- [ ] First image/frame = heal differentiator (not generic idle HUD)
- [ ] Tag **Playable** only if the live link works on mobile
- [ ] One sentence thesis + honest “solo / early” if true
- [ ] No “best idle ever”; no save dumps as hero image
- [ ] Link to `play.html`, not only repo root

---

## 4. Creator DM (copy/paste)

> Hey — quick ask. Hex Compiler is a free browser idle where the **UI heals** as you progress (mute-readable SYSTEM_RESTORE).  
> 15s mute clip attached / link: [play]  
> If you try it on stream, console seed for a fast heal is in the creator note (dev-only, not a player cheat). Happy to answer balance questions.

**Streamer seed (dev console only — not public skip):**
```js
localStorage.setItem('tutorialCompleted','true');
localStorage.setItem('hasSeenStoryIntroduction','true');
// after game loads:
window.uiManager?.systems?.designTierSystem?.emitTierAdvance?.(0, 1);
// SHARE_RESTORE should appear; toast: SYSTEM_RESTORE … was v0.0
```

---

## 5. Human mute field (Pass 2) — do this week

See `FIELD_MUTE_CLIP.md` § Pass 2. Minimum:

| Gate | Rule |
|------|------|
| Restore language | ≥4/5 spontaneous restored/healed/fixed/online |
| Intent | ≥3/5 would open the link (yes/probably) |
| Sample | n=5 never-players, volume off, one play, no rewind |

**If Pass:** community post + creator DMs.  
**If Soft pass:** one contrast pass, no paid UA.  
**If Fail:** stop virality spend; ceremony/clip redesign.

---

## 6. 14-day operator cadence

| Day | Action |
|-----|--------|
| 1 | Phone: SHARE_RESTORE → actually get a file/share sheet on iOS + Android |
| 2 | Export mute clip from `field-stimulus` or fresh record |
| 3–4 | Human n=5 (Pass 2 scoring sheet) |
| 5 | Decision log in `FIELD_MUTE_CLIP.md` |
| 6–7 | One community post (heal-first) |
| 7–14 | 5 creator DMs + 2 short-form posts of the **same** clip |
| Ongoing | Tally public shares toward pivot N=50 (`PIVOT_REBASELINE.md`) |

**Track only:** restore language, open-link intent, public share count. Ignore follower vanity.
