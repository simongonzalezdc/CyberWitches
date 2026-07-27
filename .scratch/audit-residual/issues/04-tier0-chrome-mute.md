# 04 — Tier 0 mutes restored chrome at first paint

**Status:** done

**What to build:** When body has tier-0, primary HUD chrome should not look fully Kyanite-restored (hard cyan glows / glass luxury). Suppress or desaturate key glow classes under `.tier-0` so progressive restoration is visible.

**Blocked by:** None — can start immediately.

## Acceptance criteria
- [ ] CSS under body.tier-0 reduces glow-text / glass-panel luxury on primary HUD
- [ ] Higher tiers still get full chrome when tier class advances
- [ ] Contract test or CSS presence assertion for tier-0 rules
- [ ] Tests pass

## Comments

- Implemented 2026-07-27; verified via tests/unit/auditResidual.test.js

