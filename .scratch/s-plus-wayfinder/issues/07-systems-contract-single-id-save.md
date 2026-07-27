# 07 — Systems contract: single id space + save migrate

**Tracker:** https://git.kyanitelabs.tech/simon/CyberWitches/issues/56  
**What to build:** Contract dual-graph: one workstation id space in save and craft; migrate legacy ids; remove dual counters so Systems S+ is claimable.

**Blocked by:** 55 06 — Systems migrate: production sole path through projection

**Status:** ready-for-agent

- [ ] New saves store one id space only
- [ ] Legacy saves migrate without data loss (round-trip test)
- [ ] No dual role-count sources remaining in live path
- [ ] playtest-kernel + kernel-void-save green
- [ ] CLAIM_AUDIT / LEGACY_PARK updated: dual-graph not live architecture
