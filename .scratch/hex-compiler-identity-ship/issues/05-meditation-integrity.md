# 05 — Meditation integrity

**Status:** done

**What to build:** Meditation remains post-prestige only. Stats that feed production bonus (waves completed, distractions killed, sessions completed) survive save and load. Stuck distractions are detected by actual position motion, not “still far from waypoint.”

**Blocked by:** None — can start immediately.

## Acceptance criteria

- [ ] load restores totalWavesCompleted, totalDistractionsKilled, totalSessionsCompleted when present in save.
- [ ] save continues to write those fields.
- [ ] Stuck detection uses position delta (or decreasing distance over time), not mere remaining distance > epsilon.
- [ ] No early pre-prestige meditation teaser added in this ticket.
- [ ] Round-trip / semantic coverage for the above.
- [ ] Relevant tests pass.

## Comments

- Implemented in session 2026-07-27; verified via sessionShipMust + full unit suite + lint/typecheck/build:prod.
