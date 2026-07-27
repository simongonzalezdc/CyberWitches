# 05 — Lazy-load failure player recovery

**Status:** done  
**Type:** task  
**Blocked by:** None — can start immediately.

## What to build

Lazy chunk failures currently `console.warn` only. Player should get a recoverable UI signal (SYSTEM_LOG + optional notification) and a retry where safe (audio/tutorial/particles).

## Acceptance criteria

- [ ] At least one critical lazy failure path surfaces player-visible recovery copy
- [ ] SYSTEM_LOG or notification on failure
- [ ] Retry or degrade gracefully without silent broken UI
- [ ] Tests or stubbed failure path covered
