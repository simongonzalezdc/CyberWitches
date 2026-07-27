# Hex Compiler (CyberWitches)

**A browser-based idle/incremental game where you compile fading magic into hexadecimal code — for fans of clicker and incremental games who like a story.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## What it is

Hex Compiler is an idle game, published in the `CyberWitches` repository, that runs entirely in the browser. You play one of the last Hex Compilers, translating magical hexes into hexadecimal code and building digital preservation chambers to fight the fading of magic. It is built in vanilla JavaScript (ES2023 modules) with no runtime framework, bundled with esbuild, and ships with a service worker and web app manifest for offline play. As you preserve more magic, the deliberately glitched UI progressively stabilizes — the interface itself is part of the story.

**Thesis (mute-readable):** broken terminal chrome **heals** as you progress. A tier advance is a **SYSTEM_RESTORE** moment; **SHARE_RESTORE** exports a sanitized before/after still (no full save secrets).

**Restoration Kernel (live):** pure domain dispatch under `js/kernel/` owns **cast resources** and **soft fade**; live craft remains the workstation ladder with **pipeline roles** (Capture → Store → Bind → Compile → Shield) on the HUD and cards. Affinity foreshadow and optional Meditation mastery production mult are Kernel-backed. Player/agent guides: [`guides/restoration-kernel/`](guides/restoration-kernel/). Quality bar: [`guides/restoration-kernel/QUALITY_BAR.md`](guides/restoration-kernel/QUALITY_BAR.md).

## Source of truth (remotes)

**Forgejo** at `git.kyanitelabs.tech` is the canonical remote for pull requests and merges. **GitHub** (`simongonzalezdc/CyberWitches`) is the push mirror that powers **GitHub Pages** deploy (`npm ci` + `build:prod`). If Pages lags, check the **Deploy** workflow — not only the Forgejo tip.

## Install / Quick start

```bash
npm install
npm start        # dev server on http://localhost:3000 (opens a browser)
```

Production build:

```bash
npm run build:prod   # outputs static files to dist/
```

Serve the contents of `dist/` from any static web host (configure it to serve `index.html` for all routes, with `play.html` available for direct game access). See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment steps.

**Play the game:** [https://simongonzalezdc.github.io/CyberWitches/play.html](https://simongonzalezdc.github.io/CyberWitches/play.html)

## Usage

Once the dev server is running, the game plays in the browser — cast spells manually or automate them, craft preservation chambers, buy upgrades, and run experiments to discover new techniques. Useful scripts:

```bash
npm test               # Jest unit suite
npm run ci             # lint + typecheck + typecheck:kernel + content validate + playtest:kernel + test
npm run playtest:kernel # automated Kernel playtest sim (n=5)
npm run lint           # ESLint over js/**
npm run optimize:images # re-compress background images with sharp
```

Core systems: EXEC cast (Kernel resources), soft fade / storage pressure, workstation automation with pipeline roles, inscriptions, experimentation, prestige + affinity strategies, achievements, daily rituals, Meditation (post-prestige), design-tier heal ceremony + SHARE_RESTORE.

## Why / how it works

The hook is that the **UI is diegetic**. Hex Compiler uses a five-tier design system (Tier 0-4) that maps your progress onto the interface: Tier 0 is monochrome with maximum glitch (screen tearing, chromatic aberration, scanlines, text corruption, jitter), and each tier you reach adds color, sound effects (Tier 2+), full graphics, and finally procedural ambient music (Tier 4+) as the glitches resolve to nothing. The "fading magic" theme is literally rendered as visual instability that you fix by playing. Tier advances play a short **heal ceremony** (respecting `prefers-reduced-motion`) and surface **SHARE_RESTORE** for a privacy-safe split still. Post-tutorial, a single **compile goal** rail points at the next real beat (not a second quest HUD). Audio is driven by self-hosted [Tone.js](https://tonejs.github.io/) from `vendor/tone-15.1.22.js`, styling is plain CSS with custom properties, and offline play comes from a service worker + web app manifest.

## Best-fit searches

browser idle game · incremental clicker game open source · vanilla JavaScript idle game · PWA incremental game · esbuild game project · hexadecimal coding game · idle game with glitch UI · Tone.js procedural game music

## Links

- **Game manual:** [GAME_MANUAL.md](GAME_MANUAL.md)
- **User guide:** [USER_GUIDE.md](USER_GUIDE.md)
- **Agent / domain map:** [CONTEXT.md](CONTEXT.md)
- **Restoration Kernel guides:** [guides/restoration-kernel/](guides/restoration-kernel/) (manual, schema, claim-audit, quality bar)
- **Privacy:** [PRIVACY.md](PRIVACY.md)
- **Deployment guide:** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) (also `docs/deployment/` if present)
- **Play the game:** [simongonzalezdc.github.io/CyberWitches/play.html](https://simongonzalezdc.github.io/CyberWitches/play.html)
- **Campaign artifacts (Capture the heal — historical):** [.scratch/capture-the-heal/](.scratch/capture-the-heal/)
- **API docs:** [docs/API.md](docs/API.md)
- **License:** [MIT](LICENSE)
- **KyaniteLabs:** [kyanitelabs.tech](https://kyanitelabs.tech)
- **Sibling projects:** [GameStory-Lab](https://github.com/simongonzalezdc/GameStory-Lab) · [voice-to-sculpture-app](https://github.com/simongonzalezdc/voice-to-scultpure-app) · [Print-OS](https://github.com/simongonzalezdc/Print-OS) · [grocery-flywheel](https://github.com/simongonzalezdc/grocery-flywheel) · [HealthAdvocate](https://github.com/simongonzalezdc/healthadvocate)
