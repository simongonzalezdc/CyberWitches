# Restoration Kernel — documentation index

**Status:** live on production (2026-07-27).  
**Code:** `js/kernel/` + `css/aesthetic-v2.css`  
**Play:** https://simongonzalezdc.github.io/CyberWitches/play.html  
**Release:** **v1.1.0** · overall S+ O2 stamped on tip `0bc6c31` (PR #58)

| Doc | Audience | Contents |
|-----|----------|----------|
| [MANUAL.md](MANUAL.md) | Players | EXEC, fade, pipeline, storage HUD, prestige band, affinity, Meditation |
| [ADVERSARIAL_GD_REVIEW.md](ADVERSARIAL_GD_REVIEW.md) | Designers / agents | Hostile GD: scaling, difficulty, anti-cliché |
| [STORY_BIBLE.md](STORY_BIBLE.md) | Writers / designers | Chapters and qualities |
| [SCHEMA.md](SCHEMA.md) | Agents / eng | Commands, events, content, ownership, fade weights |
| [PLAYTEST_PROTOCOL.md](PLAYTEST_PROTOCOL.md) | QA | Human + automated gates (incl. G5 prestige) |
| [GOAL.md](GOAL.md) | Eng | Ceiling-close goal (DONE) |
| [QUALITY_BAR.md](QUALITY_BAR.md) | Eng / product | Overall S+ O2: Eng∩Product∩Systems∩Identity |
| [QUALITY_REPORT.md](QUALITY_REPORT.md) | Eng / product | Tip-dated scorecard |
| [CLAIM_AUDIT.md](CLAIM_AUDIT.md) | Eng / auditors | Evidence map; residuals |
| [POST_SHIP_STAMP.md](POST_SHIP_STAMP.md) | Eng / agents | Same-session tip stamp after merge |
| [LEGACY_PARK.md](LEGACY_PARK.md) | Eng | Ownership + kill-list |

## Related repo docs

- Domain map: [`CONTEXT.md`](../../CONTEXT.md)
- Architecture: [`docs/architecture.md`](../../docs/architecture.md)
- Player manuals: [`GAME_MANUAL.md`](../../GAME_MANUAL.md), [`USER_GUIDE.md`](../../USER_GUIDE.md)
- Overhaul PRD/tickets (planning history): [`.scratch/full-overhaul/`](../../.scratch/full-overhaul/)
- Capture the heal (campaign history): [`.scratch/capture-the-heal/`](../../.scratch/capture-the-heal/)
- Spec / tickets for S+ O2: [`.scratch/s-plus-wayfinder/`](../../.scratch/s-plus-wayfinder/)

## Quick verify

```bash
npm run playtest:kernel
npm run typecheck && npm run typecheck:kernel
npm run validate:kernel-content
```
