# Spellwright

Magic is fading. You are a Spellwright—one of the last who can preserve it. Cast spells, build preservation chambers, and fight the fading. An idle game about preserving magic before it disappears forever.

## Quick Start

### Development
```bash
npm install
npm start
```

### Production Build
```bash
npm run build:prod
```

The built files will be in the `dist/` folder, ready for deployment.

## Deployment

See [DEPLOYMENT_README.md](./DEPLOYMENT_README.md) for detailed deployment instructions.

Quick deployment steps:
1. Build: `npm run build:prod`
2. Upload `dist/` folder contents to your web server
3. Configure server to serve `index.html` for all routes (SPA)

## Features

- ✨ Manual and automatic spell casting (gather magic before it fades)
- 🏭 Preservation chamber crafting and automation
- 📜 Upgrade system with inscriptions (refine preservation techniques)
- 🔬 Experimentation to discover new preservation techniques
- ⚡ Ascension system with elemental specialization choices
- 🏆 Achievement system
- 📅 Daily rituals (maintenance rituals to keep preserved magic stable)
- 🧘 Meditation mini-game (defend your mind from the mental toll of the fading)
- 🎵 Procedural ambient music (Tier 4+)
- 🔊 Sound effects (Tier 2+)
- 📱 Progressive Web App (PWA) support
- ♿ Accessibility features
- 🎨 Progressive glitch effects (UI starts glitchy and stabilizes as you progress)
- 🌈 Visual fading theme effects (represent the fading magic)

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES2023 modules)
- **Build Tool**: esbuild
- **Audio**: Tone.js
- **Styling**: CSS3 with CSS variables
- **PWA**: Service Worker + Web App Manifest

## Project Structure

```
CyberWitches/
├── index.html          # Main HTML file
├── styles.css          # Main stylesheet
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── js/                # JavaScript modules
├── images/            # Game images
├── icons/             # PWA icons
├── dist/              # Production build output
└── docs/              # Documentation
```

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for development
- `npm run build:prod` - Build for production
- `npm test` - Run tests
- `npm run optimize:images` - Optimize images

### Design Tiers

The game uses a progressive design tier system that reveals features as players progress. The UI starts heavily glitched and progressively stabilizes as you preserve more magic:

- **Tier 0**: Minimal UI (monochrome, maximum glitch effects)
- **Tier 1**: Basic color (heavy glitch effects)
- **Tier 2**: Sound effects (moderate glitch effects)
- **Tier 3**: Full graphics (light glitch effects)
- **Tier 4**: Music (perfect, no glitches)

### Glitch Effects System

The UI starts heavily glitched at Tier 0 and progressively stabilizes until it's perfect at Tier 4. This represents the "fading magic" theme - as you preserve more magic, the UI becomes more stable. Effects include:
- Screen tearing / horizontal glitch lines
- Chromatic aberration (RGB channel separation)
- Scanlines (CRT monitor effect)
- Text corruption / character flicker
- Position jitter (micro-shifts)
- Opacity flicker
- Distortion waves
- Glitchy gradient (fading theme overlay)

## Documentation

- [GAME_MANUAL.md](./GAME_MANUAL.md) - Complete game manual
- [DEPLOYMENT_README.md](./DEPLOYMENT_README.md) - Deployment guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment checklist
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Comprehensive deployment guide
- [docs/API.md](./docs/API.md) - API documentation

## License

MIT
