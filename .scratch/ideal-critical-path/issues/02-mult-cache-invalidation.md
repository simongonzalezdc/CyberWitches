# 02 — Mult-cache invalidation correctness

**What to build:** When buffs or meditation production bonus change, production multipliers update without manual cache surgery. Players never see stale ABPS after a real state change.

**Blocked by:** None — can start immediately (Lane Loop).

**Status:** ready-for-agent

- [ ] Unit test fails if mult stays stale after buff or meditation bonus change
- [ ] Invalidation is automatic on those state changes
- [ ] Existing production behavior otherwise preserved; CI green
