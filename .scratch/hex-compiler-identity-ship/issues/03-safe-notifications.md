# 03 — Safe notifications

**Status:** done

**What to build:** The notification sink defaults to text-safe rendering. Trusted HTML (e.g. known CSS icon templates) is only used intentionally. Untrusted interpolated strings cannot XSS via the default path.

**Blocked by:** None — can start immediately.

## Acceptance criteria

- [ ] Default notification path uses text content, not open raw HTML assignment for arbitrary messages.
- [ ] Explicit trusted-HTML path exists for intentional templates.
- [ ] Existing trusted icon notifications still display correctly (or are migrated deliberately).
- [ ] Live region / accessibility role behavior is preserved.
- [ ] Contract test or equivalent coverage for text-safe default.
- [ ] Relevant tests pass.

## Comments

- Implemented in session 2026-07-27; verified via sessionShipMust + full unit suite + lint/typecheck/build:prod.
