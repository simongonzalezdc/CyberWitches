# 01 — Quarantine gameState backup twin

**What to build:** Remove the confusing dead twin of GameState from the live tree so humans and agents cannot edit the wrong copy. History still holds the content if needed.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] No live `js/` twin of GameState named as a backup that can be opened by mistake
- [x] Nothing on the prod boot path imports or bundles the twin
- [x] Typecheck and lint stay green
