# 08 — Potion / inventory display completeness

**What to build:** Every lab-craftable potion or catalyst shows a human-readable name in inventory/lab UI—no blank or raw-id-only cards for known recipe outputs.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Every hidden-recipe output has a display name in the UI path
- [x] Consume path still maps to a real potion effect (no silent no-op)
- [x] Data lint or unit test fails if a new recipe output lacks a display name
