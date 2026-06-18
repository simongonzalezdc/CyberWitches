# Hex Compiler (CyberWitches)

**A browser-based idle/incremental game where you compile fading magic into hexadecimal code.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/simon/CyberWitches/actions/workflows/ci.yml/badge.svg)](https://github.com/simon/CyberWitches/actions/workflows/ci.yml)

Built with vanilla JavaScript (ES2023 modules), bundled with [esbuild](https://esbuild.github.io/), and styled with plain CSS custom properties — no runtime framework. Ships as a progressive web app with offline support.

**▶ Play the game:** [simongonzalezdc.github.io/CyberWitches/play.html](https://simongonzalezdc.github.io/CyberWitches/play.html)

---

## What Is This?

Hex Compiler is an idle game published in the `CyberWitches` repository. You play one of the last Hex Compilers — translating magical hexes into hexadecimal code, building digital preservation chambers, and fighting the fading of magic. Cast spells manually or automate them, craft preservation chambers, buy inscriptions, run experiments, and ascend to unlock elemental specializations.

The core hook is that **the UI is diegetic**. Hex Compiler uses a five-tier design system (Tier 0–4) that maps your progress onto the interface: Tier 0 is monochrome with maximum glitch effects (screen tearing, chromatic aberration, scanlines, text corruption, jitter), and each tier you reach adds color, sound effects, full graphics, and finally procedural ambient music — as the glitches resolve to nothing. The "fading magic" theme is literally rendered as visual instability that you fix by playing.

---

## Features

- **Diegetic UI progression** — a five-tier design system where the interface itself evolves as you play, from corrupted monochrome to full-color ambient music
- **Manual & automatic spell casting** — click to cast hexes or automate spell production
- **Preservation-chamber automation** — build and upgrade chambers to preserve magic at scale
- **Upgrade & inscription tree** — unlock multipliers, new mechanics, and passive bonuses
- **Experimentation system** — discover new techniques and combinations
- **Ascension & elemental specialization** — prestige system with permanent elemental upgrades
- **Achievements & daily rituals** — long-term goals and daily engagement mechanics
- **Meditation mini-game** — a focused gameplay mode with unique visuals and rewards
- **Procedural audio** — self-hosted [Tone.js](https://tonejs.github.io/) drives sound effects and ambient music generation
- **Progressive Web App (PWA)** — service worker with offline play via web app manifest
- **Responsive design** — playable on desktop and mobile browsers
- **Accessible** — tested with [axe-core](https://github.com/dequelabs/axe-core) and Playwright a11y specs
- **No external runtime dependencies** — vanilla JS, vanilla CSS, zero framework overhead
- **Comprehensive test suite** — Jest unit tests and Playwright E2E tests (visual, a11y, smoke, PWA)

---

## Installation

**Prerequisites:** Node.js ≥18.14 (supports 18, 20, 22, 24+)

```bash
git clone https://github.com/simon/CyberWitches.git
cd CyberWitches
npm install
```

---

## Quick Start

Start the dev server (opens a browser at `http://localhost:3000`):

```bash
npm start
```

Play the game by navigating to [`play.html`](play.html) in your browser, or visit the live deployment:

**[simongonzalezdc.github.io/CyberWitches/play.html](https://simongonzalezdc.github.io/CyberWitches/play.html)**

---

## Usage

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server on `http://localhost:3000` |
| `npm run build` | Build to `dist/` |
| `npm run build:prod` | Production build to `dist/` |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with coverage report |
| `npm run test:e2e` | Run all Playwright E2E tests |
| `npm run test:visual` | Visual regression tests |
| `npm run test:operator` | Operator sentry tests |
| `npm run lint` | ESLint over `js/**` |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run lint:color-debt` | Check for color token violations |
| `npm run typecheck` | TypeScript type checking (no emit) |
| `npm run optimize:images` | Re-compress background images with sharp |
| `npm run format` | Prettier formatting |
| `npm run docs` | Generate JSDoc API documentation |

### Production Build & Deployment

```bash
npm run build:prod    # outputs static files to dist/
npm run preview       # preview the production build locally
```

Serve the contents of `dist/` from any static web host. Configure it to serve `index.html` as the landing page and `play.html` for direct game access. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full deployment steps.

### Project Structure

```
.
├── index.html          # Landing / SEO page
├── play.html           # Game shell
├── sw.js               # Service worker (offline support)
├── manifest.json       # PWA manifest
├── build.js            # esbuild bundler config
├── css/                # Stylesheets (base, components, layout, animations, glitch effects…)
├── js/                 # Game source
│   ├── game.js         # Main game loop
│   ├── gameState.js    # State management & persistence
│   ├── core/           # Core engine modules
│   ├── ui/             # UI components
│   ├── config/         # Game configuration
│   ├── modules/        # Feature modules
│   ├── tests/          # In-source test utilities
│   └── utils/          # Shared utilities
├── styles/             # Theme and landing page styles
├── images/             # Game art and UI assets
├── vendor/             # Self-hosted Tone.js
├── tests/              # Jest unit tests
├── e2e/                # Playwright E2E specs
├── docs/               # Extended documentation
├── scripts/            # Build & lint scripts
└── screenshots/        # Captures for docs and store listings
```

---

## FAQ

### Does Hex Compiler require a server to play?

No. Once loaded, the service worker caches everything for offline play. You can continue playing without an internet connection. There is also a standalone `offline.html` for fully offline use.

### What browsers are supported?

Hex Compiler works in any modern browser with ES module and service worker support — Chrome, Firefox, Safari, and Edge (current and one major version back). Mobile browsers are supported with a responsive layout.

### How does the diegetic UI / design system work?

The game uses a five-tier design system (Tier 0 through Tier 4). New players start at Tier 0, where the interface is monochrome and heavily glitched. As you progress through the game, higher tiers unlock progressively: color tokens appear, sound effects activate, full graphics load, and procedural ambient music begins. By Tier 4, the glitches resolve completely — the interface reflects your success in preserving magic.

### Can I contribute to the project?

Yes! See the [Contributing](#contributing) section below. The project uses standard open-source workflows with issues and pull requests.

### How do I run the tests?

```bash
npm test              # unit tests (Jest)
npm run test:e2e      # end-to-end tests (Playwright)
npm run test:visual   # visual regression tests
npm run test:coverage # coverage report
```

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

**Development workflow:**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Install dependencies: `npm install`
4. Make your changes
5. Run the full CI check locally:
   ```bash
   npm run ci   # lint + color-debt check + typecheck + unit tests
   ```
6. Commit with a descriptive message
7. Open a pull request against `main`

**Code quality gates** (all enforced in CI):
- ESLint (`npm run lint`)
- Color token debt check (`npm run lint:color-debt`)
- TypeScript type checking (`npm run typecheck`)
- Jest unit tests (`npm test`)
- Playwright E2E tests (`npm run test:e2e`)

For architectural context and design rationale, see [CONTEXT.md](CONTEXT.md) and [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md).

---

## Documentation

| Document | Description |
|----------|-------------|
| [GAME_MANUAL.md](GAME_MANUAL.md) | Player-facing game manual |
| [USER_GUIDE.md](USER_GUIDE.md) | Detailed user guide |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment instructions |
| [docs/API.md](docs/API.md) | Internal API reference |
| [docs/design-system.md](docs/design-system.md) | Kyanite design system documentation |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [CONTEXT.md](CONTEXT.md) | Project context and architecture |
| [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md) | Product vision and roadmap |
| [FUTURE_DEVELOPMENT.md](FUTURE_DEVELOPMENT.md) | Planned features and ideas |
| [ATTRIBUTION.md](ATTRIBUTION.md) | Third-party assets and licenses |
| [SECURITY.md](SECURITY.md) | Security policy |
| [PRIVACY.md](PRIVACY.md) | Privacy information |
| [TERMS.md](TERMS.md) | Terms of use |

---

## License

This project is licensed under the [MIT License](LICENSE).