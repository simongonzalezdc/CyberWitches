# 07 — npm toolchain audit fix (non-breaking)

**Status:** done  
**Type:** task  
**Blocked by:** None — can start immediately.

## What to build

Address `npm audit` high vulns in toolchain where non-breaking (`npm audit fix` / pin bumps). Do not break build. Document residual accepted risk.

## Acceptance criteria

- [ ] `npm audit` high count reduced or residual documented in ticket answer
- [ ] `npm run build:prod` and tests still pass
- [ ] No unrelated major upgrades without need
