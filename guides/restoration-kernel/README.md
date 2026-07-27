# Restoration Kernel — documentation index

**Status:** live on production (2026-07-27).  
**Code:** `js/kernel/` · **Play:** https://simongonzalezdc.github.io/CyberWitches/play.html

| Doc | Audience | Contents |
|-----|----------|----------|
| [MANUAL.md](MANUAL.md) | Players | EXEC, fade, pipeline, prestige, affinity, Meditation |
| [ADVERSARIAL_GD_REVIEW.md](ADVERSARIAL_GD_REVIEW.md) | Designers / agents | Hostile GD pass: scaling, difficulty, anti-cliché, aesthetic |
| [STORY_BIBLE.md](STORY_BIBLE.md) | Writers / designers | Chapters and qualities |
| [SCHEMA.md](SCHEMA.md) | Agents / eng | Commands, events, content pack shape |
| [PLAYTEST_PROTOCOL.md](PLAYTEST_PROTOCOL.md) | QA | Human + automated gates |
| [GOAL.md](GOAL.md) | Eng | Ceiling-close goal (DONE) |
| [QUALITY_BAR.md](QUALITY_BAR.md) | Eng / product | S+/A+ measurable thresholds |
| [QUALITY_REPORT.md](QUALITY_REPORT.md) | Eng / product | Latest Q1–Q8 scorecard |
| [CLAIM_AUDIT.md](CLAIM_AUDIT.md) | Eng / auditors | Evidence map; non-eng residuals |
| [LEGACY_PARK.md](LEGACY_PARK.md) | Eng | Ownership + kill-list |

## Related repo docs

- Domain map: [`CONTEXT.md`](../../CONTEXT.md)
- Architecture: [`docs/architecture.md`](../../docs/architecture.md)
- Player manuals: [`GAME_MANUAL.md`](../../GAME_MANUAL.md), [`USER_GUIDE.md`](../../USER_GUIDE.md)
- Overhaul PRD/tickets (planning history): [`.scratch/full-overhaul/`](../../.scratch/full-overhaul/)
- Capture the heal (campaign history): [`.scratch/capture-the-heal/`](../../.scratch/capture-the-heal/)

## Quick verify

```bash
npm run playtest:kernel
npm run typecheck && npm run typecheck:kernel
npm run validate:kernel-content
```
