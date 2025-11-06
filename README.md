# Cyber Witches: Idle Coven

A magical idle game about casting spells and building workstations.

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

- ✨ Manual and automatic spell casting
- 🏭 Workstation crafting and automation
- 📜 Upgrade system with inscriptions
- 🔬 Experimentation to discover recipes
- ⚡ Prestige system for permanent bonuses
- 🏆 Achievement system
- 📅 Daily rituals
- 🔮 Coven system
- 🧘 Meditation mini-game
- 🎵 Procedural ambient music (Tier 4+)
- 🔊 Sound effects (Tier 2+)
- 📱 Progressive Web App (PWA) support
- ♿ Accessibility features

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

The game uses a progressive design tier system that reveals features as players progress:

- **Tier 0**: Minimal UI (text only)
- **Tier 1**: Basic color
- **Tier 2**: Sound effects
- **Tier 3**: Full graphics
- **Tier 4**: Music

## Documentation

- [GAME_MANUAL.md](./GAME_MANUAL.md) - Complete game manual
- [DEPLOYMENT_README.md](./DEPLOYMENT_README.md) - Deployment guide
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment checklist
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Comprehensive deployment guide
- [docs/API.md](./docs/API.md) - API documentation

## License

MIT
