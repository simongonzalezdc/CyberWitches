# 01 — Color-debt regression + ratchet

**Status:** done  
**Type:** task  
**Blocked by:** None — can start immediately.

## What to build

`npm run lint:color-debt` currently **FAIL**s: `css/components.css` 51 > baseline 46 after Tier-0 mute CSS. Restore green CI without undoing Tier-0 intent: move hard-coded colors to tokens or update baseline only if tokens are used correctly. Then ratchet baseline down where safe (target: no file above baseline; plan path toward lower total).

## Acceptance criteria

- [ ] `npm run lint:color-debt` exits 0
- [ ] Tier-0 mute behavior still present under `body.tier-0`
- [ ] No new hard-coded color debt introduced without baseline honesty
- [ ] Full `npm run ci` or equivalent gates green
