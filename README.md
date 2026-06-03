# Hex Compiler

**A browser-based idle/incremental game where you compile fading magic into hexadecimal code — for fans of clicker and incremental games who like a story.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8.svg)](manifest.json)

## What it is

Hex Compiler is an idle game that runs entirely in the browser. You play one of the last Hex Compilers, translating magical hexes into hexadecimal code and building digital preservation chambers to fight the fading of magic. It is built in vanilla JavaScript (ES2023 modules) with no runtime framework, bundled with esbuild, and ships as an installable Progressive Web App. As you preserve more magic, the deliberately glitched UI progressively stabilizes — the interface itself is part of the story.

## Install / Quick start

```bash
npm install
npm start        # dev server on http://localhost:3000 (opens a browser)
```

Production build:

```bash
npm run build:prod   # outputs static files to dist/
```

Serve the contents of `dist/` from any static web host (configure it to serve `index.html` for all routes). See [DEPLOYMENT_README.md](DEPLOYMENT_README.md) for full deployment steps.

## Usage

Once the dev server is running, the game plays in the browser — cast spells manually or automate them, craft preservation chambers, buy upgrades, and run experiments to discover new techniques. Useful scripts:

```bash
npm test               # run the Jest test suite
npm run lint           # ESLint over js/**
npm run optimize:images # re-compress background images with sharp
```

Core systems: manual & automatic spell casting, preservation-chamber automation, an upgrade/inscription tree, experimentation, an ascension system with elemental specialization, achievements, daily rituals, and a meditation mini-game.

## Why / how it works

The hook is that the **UI is diegetic**. Hex Compiler uses a five-tier design system (Tier 0–4) that maps your progress onto the interface: Tier 0 is monochrome with maximum glitch (screen tearing, chromatic aberration, scanlines, text corruption, jitter), and each tier you reach adds color, sound effects (Tier 2+), full graphics, and finally procedural ambient music (Tier 4+) as the glitches resolve to nothing. The "fading magic" theme is literally rendered as visual instability that you fix by playing. Audio is driven by [Tone.js](https://tonejs.github.io/) (loaded via CDN), styling is plain CSS with custom properties, and offline play comes from a service worker + web app manifest.

## Best-fit searches

browser idle game · incremental clicker game open source · vanilla JavaScript idle game · PWA incremental game · esbuild game project · hexadecimal coding game · idle game with glitch UI · Tone.js procedural game music

## Links

- **Game manual:** [GAME_MANUAL.md](GAME_MANUAL.md)
- **Deployment guide:** [DEPLOYMENT_README.md](DEPLOYMENT_README.md)
- **API docs:** [docs/API.md](docs/API.md)
- **License:** [MIT](LICENSE)
- **KyaniteLabs:** [kyanitelabs.tech](https://kyanitelabs.tech)
- **Sibling projects:** [GameStory-Lab](https://github.com/simongonzalezdc/GameStory-Lab) · [voice-to-sculpture-app](https://github.com/simongonzalezdc/voice-to-scultpure-app) · [Print-OS](https://github.com/simongonzalezdc/Print-OS) · [grocery-flywheel](https://github.com/simongonzalezdc/grocery-flywheel) · [HealthAdvocate](https://github.com/simongonzalezdc/healthadvocate)
