# 08 — Save store ownership (IndexedDB primary spike)

**Status:** done  
**Type:** task  
**Blocked by:** None — can start immediately.

## What to build

SAVE-01: Decide primary store (localStorage vs IndexedDB). Spike: flip or document dual-store with clear primary, migration, and mobile 5MB rationale. Prefer small spike + ADR over big rewrite.

## Acceptance criteria

- [ ] ADR or CONTEXT note: which store is primary and why
- [ ] If flip: save/load round-trip test passes on IndexedDB primary path
- [ ] If keep localStorage primary: dual-store documented; no false “durable pipeline” claims
- [ ] Tests pass
