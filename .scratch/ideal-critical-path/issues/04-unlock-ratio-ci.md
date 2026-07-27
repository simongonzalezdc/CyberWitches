# 04 — Unlock-ratio CI bound

**What to build:** Producer unlock density cannot silently re-open a multi-x void; a permanent unit/data lint enforces the max consecutive unlock ratio bound.

**Blocked by:** None — can start immediately (Lane CI).

**Status:** ready-for-agent

- [ ] Unit/data test fails if max consecutive positive unlock ratio exceeds the bound (default <5)
- [ ] Bound and rationale documented once in ticket Answer
- [ ] CI green on current main data
