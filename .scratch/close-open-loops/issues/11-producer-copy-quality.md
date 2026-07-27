# 11 — Producer copy quality pass

**Status:** done  
**Type:** task  
**Blocked by:** None — can start immediately.

## What to build

Related to 06 but focused: rewrite empty/missing descriptions for all producers that ship empty strings; ensure data module is source of truth for manual if needed.

## Acceptance criteria

- [ ] Every PRODUCERS entry has non-empty description OR explicit placeholder token
- [ ] Data lint test fails on empty description
- [ ] Tests pass
