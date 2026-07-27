# Contributing to simongonzalezdc/CyberWitches

<!-- EMPOWER_ORCHESTRATOR:START -->
## Agent-law contribution rule

This repository follows the Empower Orchestrator law in `docs/agent-law/empower-orchestrator.md`.

If a change exposes a repeated task or repeated agent failure, contributors and agents should either ship the smallest durable prevention artifact or explain why this PR is intentionally one-off.

Automation and durable system changes require the scale/severity/reversibility/predictability blast-radius check before dispatch.
<!-- EMPOWER_ORCHESTRATOR:END -->

## Project notes for contributors

- **Canonical remote:** Forgejo (`git.kyanitelabs.tech`); GitHub may lag as a mirror.
- **Domain map:** read [CONTEXT.md](CONTEXT.md) before deep refactors.
- **Heal / share path:** do not put save secrets into `healShare` / `healCapture` exports. Prefer extending those modules over rewriting `GameState` for share features.
- **Tests:** `npm run ci` before PR; heal journeys live under `e2e/heal-operator-journeys.spec.js`.
- **Campaign scratch:** `.scratch/capture-the-heal/` holds map, claim-audit, and growth gates (field mute-clip residual).
