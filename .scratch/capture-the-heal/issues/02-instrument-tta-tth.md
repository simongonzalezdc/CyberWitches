# 02 — Instrument TTA / TTH / share funnel (local)

**Type:** task · **Lane:** Loop · **Set:** Must · **Blocked by:** —

## Question / deliverable

How do we measure time-to-automation, time-to-heal, and share attempts without analytics sprawl?

## Answer criteria

- [ ] Local-only counters or timestamps (e.g. `cw.funnel.*`)
- [ ] TTA: first `ws_fire_forge` craft from session start
- [ ] TTH: first real `hex:tierAdvance` (not debug-only)
- [ ] Unit/e2e proof that counters move
- [ ] Provisional targets documented (TTA p50 ≤8m; TTH instrument-first)
