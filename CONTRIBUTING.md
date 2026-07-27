# Contributing to simongonzalezdc/CyberWitches

<!-- EMPOWER_ORCHESTRATOR:START -->
## Agent-law contribution rule

This repository follows the Empower Orchestrator law in `docs/agent-law/empower-orchestrator.md`.

If a change exposes a repeated task or repeated agent failure, contributors and agents should either ship the smallest durable prevention artifact or explain why this PR is intentionally one-off.

Automation and durable system changes require the scale/severity/reversibility/predictability blast-radius check before dispatch.
<!-- EMPOWER_ORCHESTRATOR:END -->

## Project notes for contributors

- **Canonical remote:** Forgejo (`git.kyanitelabs.tech`) for PRs/merges. **GitHub** is the mirror that runs **Pages Deploy** — if production lags, check Actions **Deploy** (often `npm ci` / lockfile), not only Forgejo.
- **Domain map:** read [CONTEXT.md](CONTEXT.md) before deep refactors.
- **Restoration Kernel:** pure domain in `js/kernel/`; live cast/fade must stay on the adapter. Docs: [guides/restoration-kernel/](guides/restoration-kernel/). Quality bar: `QUALITY_BAR.md`. Adversarial GD: `ADVERSARIAL_GD_REVIEW.md`.
- **Fade:** any new non-AB inventory product of craft/capture must get a `FADE_WEIGHT` entry in `js/kernel/fade.js` (no immortal banks).
- **Ownership:** craft writes must use canonical ids (`applyOwnershipDelta` / live `ws_*` for paired stations). Do not dual-count `ws_*`+`mod_*`. See `js/kernel/ownership.js`.
- **Quality:** overall S+ is Eng∩Product∩Systems∩Identity — `guides/restoration-kernel/QUALITY_BAR.md`. Tip-date QUALITY_REPORT after material ship.
- **Aesthetic:** surface polish goes in `css/aesthetic-v2.css` (or tokens in `styles/theme.css`); preserve tier-0 mono.
- **Heal / share path:** do not put save secrets into `healShare` / `healCapture` exports. Prefer extending those modules over rewriting `GameState` for share features.
- **Notifications:** do not raise `NotificationManager.maxVisible` above 2 without a visual regression check — board readability is part of the quality bar.
- **Release:** players ship via **GitHub Pages** on `main` push. Current package is **v1.1.0**. Bump `package.json` + CHANGELOG only for intentional external/marketing releases.
- **Tests:** `npm run ci` before PR (includes kernel content validate + playtest sim). Heal e2e: `e2e/heal-operator-journeys.spec.js`. Kernel e2e: `e2e/kernel-void-save.spec.js`.
- **Campaign scratch:** Capture-the-heal history in `.scratch/capture-the-heal/` (growth field pilot is ops, not Kernel residual). Kernel overhaul tickets in `.scratch/full-overhaul/`.
