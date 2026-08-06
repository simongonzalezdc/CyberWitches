# Cyber Witches: Idle Coven

A magical idle game where you build a coven of witches, craft mystical workstations, and cast powerful spells to accumulate arcane resources.

## 🎮 Features

### Core Gameplay
- **Idle Resource Generation**: Accumulate Arcane Bits (AB) automatically and through spell casting
- **Workstation Crafting**: Build and upgrade mystical workstations to boost production
- **Ingredient System**: Collect and combine magical ingredients for advanced crafting
- **Prestige System**: Ascend to gain Eldritch Keys (EK) for permanent bonuses
- **Experiment System**: Discover hidden recipes through magical experimentation
- **Achievement System**: Unlock achievements with unique rewards
- **Daily Tasks**: Complete challenges for bonus rewards

#

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection (for cloud features)

### Quick Start
1. Open the game in your browser
2. Click the "✨ Cast" button to start generating resources
3. Craft your first workstation to increase production
4. Join or create a coven to unlock social features
5. Complete achievements and discover hidden secrets

## 📖 Screenshots

### Gameplay
![Gameplay Screenshot](docs/images/gameplay.png)
*Main gameplay interface showing workstations, resources, and spell casting*

### Coven System
![Coven System Screenshot](docs/images/coven-system.png)
*Coven management interface with member list, rituals, and achievements*

### Achievements
![Achievements Screenshot](docs/images/achievements.png)
*Achievement interface showing progress and rewards*

### Events
![Events Screenshot](docs/images/events.png)
*Special events interface with competitions and limited-time activities*

## 🛠️ Development

### Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tools**: Webpack, Babel, ESLint
- **Testing**: Jest + Playwright
- **Deployment**: Static hosting (Netlify, Vercel), Node.js server, Docker

### Project Structure
```
cyber-witches/
├── docs/                 # Documentation
├── js/                   # JavaScript modules
│   ├── gameState.js      # Core game state
│   ├── achievements.js    # Achievement system
│   ├── socialLeaderboards.js # Leaderboards
│   ├── particleEffects.js # Particle effects
│   ├── audioSystem.js     # Audio system
│   ├── celebrationAnimations.js # Celebrations
│   ├── easterEggs.js    # Easter eggs
│   ├── performanceMonitor.js # Performance monitoring
│   ├── cloudSave.js      # Cloud save
│   ├── analytics.js       # Analytics
│   ├── errorHandler.js    # Error handling
│   ├── animations.js      # Animation utilities
│   ├── virtualScroll.js  # Virtual scrolling
│   ├── commonUtils.js    # Common utilities
│   └── data.js          # Game data
├── tests/                # Test files
├── index.html            # Main HTML file
├── manifest.json         # PWA manifest
└── package.json          # NPM configuration
```

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/simongonzalezdc/CyberWitches.git
   cd cyber-witches
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Building for Production

```bash
# Build for production
npm run build

# Analyze bundle size
npm run analyze
```

## 📚 Documentation

- [API Documentation](docs/API.md) - Comprehensive API reference
- [Implementation Guide](cyber_witches_implementation_guide.md) - Development guide
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment instructions
- [Image Requirements](IMAGE_REQUIREMENTS.md) - Asset specifications

## 🌐 Deployment

### Static Hosting

The game can be deployed to any static hosting service:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

### Server Deployment

For a Node.js server deployment:

1. **Install dependencies**
   ```bash
   npm install --production
   ```

2. **Start the server**
   ```bash
   npm run start:prod
   ```

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t cyber-witches .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 cyber-witches
   ```

## 🤝 Contributing

We welcome contributions to Cyber Witches: Idle Coven! Please follow these guidelines:

### Code Style
- Use ESLint configuration
- Follow existing code patterns
- Add comments for complex logic
- Use meaningful variable names

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Bug Reports
- Use the issue tracker
- Provide detailed reproduction steps
- Include browser and OS information
- Add screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Play Game**: [https://simongonzalezdc.github.io/CyberWitches/play.html](https://simongonzalezdc.github.io/CyberWitches/play.html)
- **GitHub Repository**: [https://github.com/simongonzalezdc/CyberWitches](https://github.com/simongonzalezdc/CyberWitches)
- **Discord Community**: [https://discord.gg/cyberwitches](https://discord.gg/cyberwitches)
- **Wiki**: [https://github.com/simongonzalezdc/CyberWitches/wiki](https://github.com/simongonzalezdc/CyberWitches/wiki)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped make this game possible
- Inspired by classic idle games and modern incremental games
- Special thanks to the Cyber Witches community for feedback and suggestions

---

**Made with ❤️ by the Cyber Witches development team**

> **Note:** Older “Coven / multiplayer social” surfaces were archived and are not claimed as shipped in the current build.
