# Attribution & Third-Party Licenses

This file lists all third-party code, libraries, assets, and resources used in Hex Compiler.

## Third-Party Libraries

### Tone.js
- **Purpose**: Audio synthesis and music generation
- **Version**: Latest (loaded from CDN)
- **License**: MIT License
- **Copyright**: © Yotam Mann and contributors
- **Source**: https://tonejs.github.io/
- **CDN**: https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js
- **License Text**: https://github.com/Tonejs/Tone.js/blob/dev/LICENSE

### Development Dependencies

All development dependencies are listed in `package.json` and are used only during development/testing:

- **esbuild** - MIT License - Build tool
- **jest** - MIT License - Testing framework
- **jest-environment-jsdom** - MIT License - DOM testing environment
- **sharp** - Apache 2.0 License - Image optimization
- **terser** - BSD 2-Clause License - JavaScript minifier
- **eslint** - MIT License - Code linting
- **prettier** - MIT License - Code formatting
- **jsdoc** - Apache 2.0 License - Documentation generation
- **http-server** - MIT License - Development server

## Fonts

### Orbitron
- **Purpose**: Primary game font
- **Source**: Google Fonts
- **License**: SIL Open Font License 1.1
- **Designer**: Matt McInerney
- **URL**: https://fonts.google.com/specimen/Orbitron

## Inspiration & References

This game was inspired by:
- Traditional incremental/idle games
- Magic-themed crafting systems
- Progressive web app best practices

## Code Attribution

### Service Worker
- Based on standard PWA service worker patterns
- Adapted from MDN Web Docs examples
- License: CC0 (Public Domain)
- Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

### Audio System
- Custom implementation using Tone.js
- Synthesizer configurations inspired by Tone.js documentation

### Testing Setup
- Jest ES modules configuration adapted from Jest documentation
- Manual mocking patterns developed for ES modules compatibility

## Asset Sources

### Images
All game images are either:
1. Created specifically for this project (original work)
2. Generated using AI tools for game development
3. Public domain or CC0 licensed resources

Specific attributions:
- Background images: Custom generated for this project
- Icon images: Custom generated for this project
- UI elements: Original design

## Icons & Favicons
- Generated using standard web icon tools
- Based on original game artwork

## No External Attribution Required

The following are original works created for this project:
- All JavaScript game logic
- All CSS styling (styles.css)
- All HTML structure (index.html)
- Game design and mechanics
- All game content (workstations, upgrades, recipes)
- All sound synthesis configurations
- All game balance and progression systems

## License Compatibility

All third-party components used are compatible with the MIT License under which this project is released.

## Reporting Issues

If you believe any attribution is missing or incorrect, please contact the project maintainers.

---

**Last Updated**: 2025-11-08
**Version**: 1.0.0
