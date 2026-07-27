# Growth ops — heal-moment campaign (ticket 15)

## Demo / fresh seed

1. Open `play.html` in a private window (clean localStorage).
2. Optional force tutorial: DevTools → `localStorage.removeItem('tutorialCompleted')` then reload.
3. Cast until you own Fire Forge (goal rail after tutorial: `automate_fire`).
4. Progress design tiers until `SYSTEM_RESTORE` fires (body class `tier-advance-heal` + SYSTEM_LOG).

**Seed snippet (dev only):**
```js
// After game boot — accelerate to a heal demo (does not ship in URLs)
localStorage.setItem('tutorialCompleted', 'true');
// Prefer natural unlock; if needed, advance via designTierSystem.unlockTier(n) in console when game is loaded.
```

## 15s heal clip path

1. Record screen at 1080p, 30fps, ~15s.
2. Capture: Tier N-1 chrome → unlock → flash + SYSTEM_LOG `SYSTEM_RESTORE` → optional SHARE_RESTORE click.
3. Export GIF/MP4; no need for multi-page viewer.
4. Prefer real capture over mock when available.

## Community post checklist

- [ ] Lead with broken→healed thesis (one line)
- [ ] Attach clip/GIF of restore moment
- [ ] Link to Play (not raw save dump)
- [ ] One CTA: try for free / compile
- [ ] Avoid spoiling late prestige numbers

## 30-day share pivot gate

| Metric | Threshold N | If missed |
|--------|-------------|-----------|
| Instrumented share attempts (`cw.funnel.shareAttempt`) + organic posts with heal clip | **N = 50** combined public share/attempt signals in 30 days after heal ships to main | **Stop virality spend**; reallocate to first-session pacing + heal noticeability; do not expand share UI further until N is re-tested after a product fix |

**Recorded decision date:** 2026-07-26  
**Owner:** campaign operator after W2 heal is on Forgejo main.
