# Playtest protocol — Restoration Kernel

Local, privacy-safe. n ≥ 5 sessions recommended against qualitative gates.

## Metrics (local only)

| Metric | Definition |
|--------|------------|
| TTA | Time to first capture automation (own ≥1 capture) |
| TT_buffer | Time to first Store module |
| TT_prestige | Time to first prestige recommend band |
| Chapters reached | Count of `ch*` in session |
| Void loss noticed | Y/N — player saw fade / VOID_PRESSURE |
| Intermediate still bleeds | Y/N — crafted stock still fades unbound |
| Store still useful mid-run | Y/N — buffers/shields matter after T0 |
| Ascend band noticed | Y/N — player saw ASCEND_BAND / recommend |
| Dual HUD confusion | Y/N — felt split objectives |

Local funnel: `cw.funnel.*` / heal analytics — no PII.

## Human qualitative gates

| Gate | Pass criteria |
|------|----------------|
| H1 Clarity | Player names EXEC within 30s |
| H2 Fade law | Player explains storage vs void without wiki |
| H3 Pipeline | Player names ≥3 roles after 10 min |
| H4 Prestige | Player knows Keys + what resets before ascend |
| H5 Optional TD | Meditation skip still feels progressive |

## Automated (`npm run playtest:kernel`)

| Gate | Proxy |
|------|--------|
| G1 | TTA proxy — first capture craft |
| G2 | Void fade overcap observed |
| G3 | Pipeline roles; capture owned count sane |
| G4 | Prestige band string present |
| G5 | Band `recommend` with AB/lifetime **before** void unlock (400000) |

Also: all 28 producers role-mapped.

```bash
npm run validate:kernel-content
npm run playtest:kernel
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel.test.js tests/unit/kernel-balance.test.js tests/unit/ownership-projection.test.js
npm run test:e2e:critical
```

Record private notes under `.scratch/` if needed (often gitignored).
