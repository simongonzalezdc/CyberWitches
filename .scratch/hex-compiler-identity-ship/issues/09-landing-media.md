# 09 — Landing media (Should)

**Status:** done

**What to build:** Landing no longer shows empty screenshot / hero placeholders where real or generated assets already exist. Wire screenshots and Kyanite-aligned hero/atmosphere art so the marketing surface looks intentional.

**Blocked by:** None — can start immediately.

## Acceptance criteria

- [ ] Screenshot slots that were empty now show real images where assets exist.
- [ ] Hero / atmosphere treatment uses available Kyanite-aligned art (or existing screenshots) without baked unreadable marketing text in bitmaps.
- [ ] Landing still loads and does not 404 linked media.
- [ ] This ticket is Should-tier: Must ship can proceed if this is incomplete, with honest report.

## Comments

- Implemented in session 2026-07-27; verified via sessionShipMust + full unit suite + lint/typecheck/build:prod.
