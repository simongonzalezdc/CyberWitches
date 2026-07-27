# 04 — Kill or real-sink analytics theater

**Status:** done  
**Type:** task  
**Blocked by:** None — can start immediately.

## What to build

Analytics “flush” that only writes localStorage pretends a pipeline. Either remove player-path analytics ceremony or wire a real optional sink behind a flag. Prefer delete on prod path if no consumer.

## Acceptance criteria

- [ ] Prod play path does not run fake flush loops that imply network telemetry
- [ ] If analytics remain, documented real sink or explicit “local-only debug” naming
- [ ] No new unowned intervals
- [ ] Tests pass
