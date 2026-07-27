# 02 — SYSTEM_LOG is alive, not a dead panel

**Status:** done

**What to build:** The sidebar SYSTEM_LOG / craft-notifications region shows real activity (casts, crafts, compile events) so mid-game doesn’t look unfinished.

**Blocked by:** None — can start immediately.

## Acceptance criteria
- [ ] Craft and/or cast events append lines to `#craft-notifications` (or successor)
- [ ] Log scrolls and doesn’t grow unbounded without cap
- [ ] Empty state has a diegetic placeholder until first event
- [ ] Relevant tests pass

## Comments

- Implemented 2026-07-27; verified via tests/unit/auditResidual.test.js

