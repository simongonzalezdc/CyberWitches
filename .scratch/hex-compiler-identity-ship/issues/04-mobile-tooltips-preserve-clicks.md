# 04 — Mobile tooltips that don’t kill clicks

**Status:** done

**What to build:** On touch devices, tooltips may appear via long-press, but Craft, Cast, and other primary controls still fire their actions. Tooltips must not call preventDefault in a way that cancels the click pipeline.

**Blocked by:** None — can start immediately.

## Acceptance criteria

- [ ] Mobile tooltip attach path does not preventDefault on touchstart for actionable controls.
- [ ] Long-press (or equivalent) can still reveal tooltip text.
- [ ] Primary verbs remain tappable end-to-end.
- [ ] Contract test or static assertion covers the no-preventDefault-on-touchstart rule.
- [ ] Relevant tests pass.

## Comments

- Implemented in session 2026-07-27; verified via sessionShipMust + full unit suite + lint/typecheck/build:prod.
