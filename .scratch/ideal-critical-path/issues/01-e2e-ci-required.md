# 01 — E2E required in CI

**What to build:** Protected merges cannot stay green when smoke or progression golden paths fail. Playwright is a required gate with an explicit flake budget, not an optional script.

**Blocked by:** None — can start immediately (Lane CI).

**Status:** ready-for-agent

- [ ] CI requires smoke + progression-tier (or documented equivalent golden paths)
- [ ] Failure uploads trace/screenshot/console artifact
- [ ] Flake budget / re-run policy documented so gates do not become silent red forever
- [ ] Passes on a clean run after policy applied
