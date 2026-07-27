# 02 — Prod-path interval leak gate

**Status:** done  
**Type:** task  
**Blocked by:** None — can start immediately.

## What to build

Unowned `setInterval` in economyBalancing, balanceAnalytics, progressionAnalysis, analytics flush, memoryLeakFix, and similar must not accumulate on the **player production path**. Either: do not load those modules in prod play, or register intervals with lifecycleManager and clear on teardown, or delete dead analytics theater.

## Acceptance criteria

- [ ] Document which interval owners load on play.html prod boot
- [ ] No unowned setInterval on the default play boot path OR each has clear-on-teardown via lifecycleManager
- [ ] Soft navigation / re-init does not stack intervals (test or proven no double-init)
- [ ] Tests / lint pass
