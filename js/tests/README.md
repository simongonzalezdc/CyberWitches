# Testing

## Layout

- **Unit / integration:** `tests/unit/` (Jest ESM, `NODE_OPTIONS=--experimental-vm-modules`)
- **E2E:** `e2e/` (Playwright)
- **Kernel pure:** `tests/unit/kernel*.test.js`, `tests/unit/ownership-projection.test.js`
- **Scripts:** `npm run playtest:kernel`, `npm run validate:kernel-content`, `npm run typecheck:kernel`

## Commands

```bash
npm test
npm run ci
npm run playtest:kernel
npm run test:e2e
npm run test:e2e:critical
```

## Kernel / overall S+ gates

See `guides/restoration-kernel/QUALITY_BAR.md`. Ownership coalesce and fade weights are covered by unit + playtest-kernel (incl. G5 prestige band).
