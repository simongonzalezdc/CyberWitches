# Playtest protocol — Restoration Kernel

Local, privacy-safe. n ≥ 5 sessions recommended against qualitative gates.

## Metrics (local only)

Instrument or note manually:

| Metric | Definition |
|--------|------------|
| TTA | Time to first Automation-like production (own ≥1 capture) |
| TT_buffer | Time to first Store module |
| TT_prestige | Time to first prestige recommend band |
| Chapters reached | Count of `ch*` in session |
| Void loss noticed | Y/N — player saw fade pressure |
| Dual HUD confusion | Y/N — felt split objectives |

Local funnel helpers may exist under `js/funnelMetrics.js` / heal analytics; do not ship PII.

## Script

```bash
# unit + content gate
npm run validate:kernel-content
NODE_OPTIONS=--experimental-vm-modules npx jest tests/unit/kernel.test.js tests/unit/kernel-balance.test.js

# optional critical e2e
npm run test:e2e:critical
```

## Qualitative gates (§8-style)

| Gate | Pass criteria |
|------|----------------|
| G1 Clarity | Player names EXEC within 30s |
| G2 Fade law | Player explains storage vs void without wiki |
| G3 Pipeline | Player names ≥3 roles after 10 min |
| G4 Prestige | Player knows Keys + what resets before ascend |
| G5 Optional TD | Meditation skip still feels progressive |

Record results under `.scratch/full-overhaul/playtest/` (gitignored if private).
