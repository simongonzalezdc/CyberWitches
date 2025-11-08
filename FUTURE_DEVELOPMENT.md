# Future Development Roadmap
## Spellwright - Technical & Design Improvements

**Last Updated**: 2025-11-08
**Version**: 1.0
**Status**: Planning Phase

This document outlines technical, design, and UX improvements for future development cycles. These recommendations are organized by priority and estimated effort.

---

## 📋 Table of Contents

1. [Medium Priority Recommendations](#medium-priority-recommendations)
2. [Long-Term Vision](#long-term-vision)
3. [Technical Debt](#technical-debt)
4. [Game Design Enhancements](#game-design-enhancements)
5. [UI/UX Improvements](#uiux-improvements)
6. [Implementation Timeline](#implementation-timeline)

---

## 🎯 Medium Priority Recommendations

### 1. End-to-End Testing Framework
**Effort**: Medium | **Impact**: High | **Timeline**: 2-3 weeks

**Description**: Implement E2E testing with Playwright or Cypress to test critical user flows.

**Benefits**:
- Catch UI/UX bugs before production
- Test complete user journeys
- Automate regression testing
- Improve confidence in releases

**Implementation Steps**:
1. Choose framework (Playwright recommended for cross-browser support)
2. Set up test infrastructure
3. Write critical path tests:
   - First-time user onboarding flow
   - Casting → workstation crafting → prestige flow
   - Save/load functionality
   - Mobile touch interactions
4. Add to CI/CD pipeline
5. Set up visual regression testing

**Acceptance Criteria**:
- 10+ E2E tests covering critical flows
- Tests run in CI on every PR
- Test coverage for mobile and desktop
- Visual regression tests for key screens

**Resources**:
- Playwright: https://playwright.dev/
- Cypress: https://www.cypress.io/

---

### 2. Internationalization (i18n) Framework
**Effort**: High | **Impact**: Very High | **Timeline**: 4-6 weeks

**Description**: Add internationalization support to reach global markets.

**Target Languages** (Priority Order):
1. Spanish (Spain & Latin America)
2. Portuguese (Brazil)
3. French
4. German
5. Japanese
6. Chinese (Simplified)
7. Russian
8. Korean

**Implementation Steps**:
1. Install i18next or similar framework
2. Extract all hardcoded strings
3. Create translation key structure
4. Implement language selector
5. Set up community translation platform (Crowdin/Weblate)
6. Test RTL languages (Arabic, Hebrew)
7. Handle number/date formatting per locale

**Technical Considerations**:
- String interpolation for dynamic values
- Pluralization rules per language
- Context-aware translations
- Fallback language (English)
- Dynamic loading of language packs (reduce bundle size)

**Acceptance Criteria**:
- All UI strings externalized
- Language switcher in settings
- At least 3 languages fully translated
- Community translation workflow established
- RTL layout support

**Resources**:
- i18next: https://www.i18next.com/
- Crowdin: https://crowdin.com/

---

### 3. Lightweight Social Features
**Effort**: Medium | **Impact**: High | **Timeline**: 3-4 weeks

**Description**: Add basic social features without requiring full multiplayer infrastructure.

**Features**:
1. **Global Leaderboards**:
   - Top AB earned (all-time)
   - Top prestige count
   - Fastest to first prestige
   - Top combo achieved
   - Most achievements unlocked

2. **Share Functionality**:
   - Share achievements on social media
   - Export stats as image card
   - Share custom spells/builds
   - Generate shareable links

3. **Friend Codes** (Optional):
   - Simple friend code system
   - View friends' progress (opt-in)
   - Send gifts (small AB bonuses)

**Technical Implementation**:
- Use serverless backend (Firebase, Supabase)
- Anonymous leaderboard entries (privacy-first)
- Rate limiting to prevent abuse
- Client-side validation + server verification

**Acceptance Criteria**:
- Leaderboards update in real-time
- Share feature works on major platforms
- Privacy settings for all social features
- No personal data required
- Works offline (cached leaderboards)

---

### 4. Ethical Monetization Strategy
**Effort**: Medium | **Impact**: Medium | **Timeline**: 2-3 weeks

**Description**: Implement optional, player-friendly monetization to support development.

**Recommended Model: Donation/Support Tier** (Most Ethical)

**Option 1: Supporter Tier** ($5 one-time or $2/month)
- Exclusive cosmetics (particle effects, themes)
- Cloud save with unlimited slots
- Early access to new features
- Supporter badge
- Access to beta testing
- No gameplay advantages

**Option 2: Premium Themes** ($1-3 each)
- Alternative visual themes
- Custom particle effects
- Unique sound packs
- Seasonal themes

**Option 3: Tip Jar**
- Ko-fi or Patreon integration
- Thank you message in credits
- Supporter badge

**What to AVOID**:
- ❌ Pay-to-win mechanics
- ❌ Loot boxes / gacha
- ❌ Energy systems
- ❌ Aggressive ads
- ❌ Dark patterns
- ❌ Time-gating with paid skips

**Implementation Steps**:
1. Choose payment processor (Stripe, PayPal, Ko-fi)
2. Implement cosmetics system
3. Add premium cloud save tier
4. Create supporter badge system
5. Set up thank you page
6. Add "Support Development" button (non-intrusive)

**Acceptance Criteria**:
- Payment integration works smoothly
- No gameplay locked behind paywall
- Clear value proposition for supporters
- Easy to support, never pressured
- Transparent about fund usage

---

### 5. Community Platform
**Effort**: Low | **Impact**: Medium | **Timeline**: 1-2 weeks

**Description**: Establish official community channels for player engagement.

**Platforms**:

1. **Discord Server** (Primary)
   - Channels: #general, #help, #feedback, #showcase, #memes
   - Roles: Developer, Tester, Supporter, Community Helper
   - Bot for stats sharing
   - Announcement channel

2. **Subreddit** (Optional)
   - Weekly discussion threads
   - Build sharing
   - Memes and community content

3. **Wiki** (Community-Driven)
   - Host on wiki.gg or Fandom
   - Game mechanics documentation
   - Strategy guides
   - Hidden recipe database
   - Community can contribute

**Implementation Steps**:
1. Create Discord server with structure
2. Set up moderation team
3. Create community guidelines
4. Add Discord link to game
5. Create r/Spellwright subreddit
6. Set up wiki platform
7. Seed initial wiki content

**Acceptance Criteria**:
- Active Discord with 100+ members
- Clear community guidelines
- Moderation team in place
- Wiki with core game info
- Links in-game and on website

---

## 🚀 Long-Term Vision

### 6. Platform Expansion
**Effort**: Very High | **Impact**: Very High | **Timeline**: 8-12 weeks

**Description**: Expand to new platforms for wider reach and monetization.

#### Steam Release
**Benefits**:
- Larger, engaged audience
- Monetization through sales
- Workshop for mods
- Achievements sync
- Cloud save built-in

**Requirements**:
- Steamworks SDK integration
- Steam achievements
- Workshop support (optional)
- Trading cards (optional)
- $100 Steam Direct fee

**Technical Steps**:
1. Integrate Greenworks (Steamworks for web games)
2. Convert to Electron app
3. Implement Steam achievements
4. Add Steam cloud save
5. Create store page assets
6. Submit for review

**Pricing Strategy**:
- Free-to-play with supporter DLC, OR
- $4.99 one-time purchase

#### Mobile App Stores
**Benefits**:
- Mobile-first audience
- In-app purchase potential
- Push notifications
- App store discoverability

**Requirements**:
- Capacitor or Cordova wrapper
- App store developer accounts ($99/year iOS, $25 one-time Android)
- Store listing assets
- App store compliance

**Technical Steps**:
1. Choose wrapper (Capacitor recommended)
2. Optimize for mobile performance
3. Implement in-app purchases (if monetizing)
4. Add push notifications
5. Test on multiple devices
6. Submit to stores

**Pricing Strategy**:
- Free with optional in-app purchases, OR
- $2.99 premium with no ads

---

### 7. Live Operations & Seasonal Content
**Effort**: High (Ongoing) | **Impact**: Very High | **Timeline**: Continuous

**Description**: Implement live operations to keep players engaged long-term.

**Seasonal Events** (Quarterly):
- Winter Solstice Event (December)
- Spring Awakening (March)
- Summer Arcana (June)
- Harvest Moon (September)

**Event Features**:
- Limited-time workstations
- Unique ingredients
- Special achievements
- Exclusive cosmetics
- Event leaderboards
- Increased rewards

**Implementation**:
1. Create event system framework
2. Design event calendar
3. Create event-specific content
4. Implement event rotation
5. Set up notification system
6. Track event engagement

**Weekly Challenges**:
- Earn X AB in a week
- Craft Y workstations
- Reach Z combo
- Discover hidden recipes

**Daily Login Bonuses**:
- Day 1: 100 AB
- Day 2: 200 AB
- Day 3: Rare ingredient
- Day 7: Prestige boost potion

---

### 8. Multiplayer & Coven System Revival
**Effort**: Very High | **Impact**: Very High | **Timeline**: 12-16 weeks

**Description**: Revive the archived coven system with backend infrastructure.

**Features**:
1. **Covens** (Guilds):
   - Create/join covens (up to 50 members)
   - Coven chat
   - Shared goals
   - Coven leaderboards
   - Coven bonuses

2. **Cooperative Features**:
   - Coven raids (boss battles)
   - Shared resource pool
   - Coven upgrades
   - Trading system (optional)

3. **Competitive Features**:
   - Coven wars
   - Territory control
   - Seasonal rankings
   - Rewards for top covens

**Technical Requirements**:
- Backend infrastructure (Node.js + PostgreSQL/MongoDB)
- Real-time communication (WebSockets)
- Matchmaking system
- Anti-cheat measures
- Moderation tools

**Implementation Phases**:
- Phase 1: Basic coven creation and chat
- Phase 2: Coven bonuses and shared goals
- Phase 3: Coven raids and boss battles
- Phase 4: Competitive features

---

### 9. Modding API & User-Generated Content
**Effort**: Very High | **Impact**: High | **Timeline**: 16+ weeks

**Description**: Enable community to create custom content.

**Moddable Elements**:
- Custom workstations
- Custom ingredients
- Custom recipes
- Custom visual themes
- Custom sound packs
- Custom game modes

**API Features**:
- JSON-based mod format
- Mod loader system
- Mod manager UI
- Steam Workshop integration (if on Steam)
- Mod validation
- Sandbox for mod testing

**Example Mod Structure**:
```json
{
  "mod_id": "my_custom_mod",
  "name": "Elemental Expansion",
  "version": "1.0",
  "author": "ModderName",
  "workstations": [...],
  "ingredients": [...],
  "recipes": [...]
}
```

**Implementation Steps**:
1. Design mod API specification
2. Create mod loader
3. Implement mod validation
4. Build mod manager UI
5. Create mod creation documentation
6. Set up mod sharing platform

---

### 10. Brand & IP Development
**Effort**: High (Ongoing) | **Impact**: Medium | **Timeline**: Continuous

**Description**: Develop Spellwright IP beyond the game.

**Lore Development**:
- Expand world-building
- Character backstories
- In-game codex/journal
- Lore-based achievements
- Story-driven events

**Content Expansion**:
- **Web Comic Series**: Short comics about the Fading
- **Art Book**: Concept art and behind-the-scenes
- **Soundtrack Release**: Official OST on Spotify/Bandcamp
- **Merchandise**: Stickers, t-shirts, enamel pins

**Community Content**:
- Fan art contests
- Fan fiction showcase
- Community spotlight
- Developer blog

---

## 🛠️ Technical Debt

### 11. Code Architecture Improvements

#### File Size Reduction
**Current Issues**:
- `game.js` is very large
- `styles.css` is 5,713 lines

**Solution**:
1. Split `game.js` into multiple controllers:
   - `GameController.js` (main loop)
   - `UIController.js` (UI updates)
   - `ProductionController.js` (production logic)
   - `PrestigeController.js` (prestige logic)

2. Convert CSS to CSS Modules or CSS-in-JS:
   - Component-based styling
   - Reduced global scope
   - Better code splitting

#### ESLint v9 Migration
**Current**: Using ESLint v8
**Target**: ESLint v9 with flat config

**Steps**:
1. Update ESLint to v9
2. Convert `.eslintrc.json` to `eslint.config.js`
3. Update plugins to v9-compatible versions
4. Fix any new linting errors
5. Update CI/CD to use new config

#### Audio Library Update
**Current**: Tone.js with deprecated ScriptProcessorNode
**Target**: AudioWorklet-based implementation

**Options**:
1. Wait for Tone.js update (low effort, uncertain timeline)
2. Create custom AudioWorklet implementation (high effort, full control)
3. Use alternative library (medium effort, potential feature loss)

**Recommendation**: Create custom AudioWorklet implementation for better control and performance.

---

## 🎮 Game Design Enhancements

### 12. Meta-Progression System
**Effort**: Medium | **Impact**: High | **Timeline**: 3-4 weeks

**Description**: Add long-term goals beyond prestige.

**Features**:
1. **Mastery Levels**:
   - Level up each workstation through use
   - Unlock mastery bonuses
   - Show mastery progress

2. **Research Tree**:
   - Unlock new game systems
   - Permanent upgrades
   - Alternative progression path

3. **Collections**:
   - Collect rare ingredients
   - Complete ingredient sets for bonuses
   - Display collection progress

4. **Legacy System**:
   - Track total lifetime stats
   - Legacy achievements
   - Historical milestones

---

### 13. Element Specialization Improvements
**Effort**: Medium | **Impact**: Medium | **Timeline**: 2-3 weeks

**Current Issues**:
- No respec mechanism
- Paths may not be balanced
- Choice feels permanent and risky

**Solutions**:

1. **Respec System**:
   - Cost: 50% of current EK (Eldritch Keys)
   - Unlocks after 3rd prestige
   - Allows experimentation
   - Add warning modal

2. **Element Preview**:
   - Show detailed stats for each element
   - Calculate expected bonuses
   - Provide recommendations based on playstyle

3. **Hybrid Specializations** (Advanced):
   - Unlock after 10th prestige
   - Choose primary + secondary element
   - Reduced bonuses but more flexibility

**Implementation**:
1. Add respec button to Boons tab
2. Create confirmation modal
3. Implement EK cost calculation
4. Add element preview UI
5. Balance all 4 paths equally

---

### 14. Experiment System Improvements
**Effort**: Low | **Impact**: Medium | **Timeline**: 1-2 weeks

**Current Issues**:
- No hints for hidden recipes
- Discovery feels random
- Frustrating for completionists

**Solutions**:

1. **Hint System**:
   - Vague hints after failed experiments
   - Progressive hints (3 attempts = clear hint)
   - "Getting warmer" feedback

2. **Experiment Log**:
   - Track all experiments tried
   - Show partial matches
   - Suggest next experiments

3. **Discovery Achievements**:
   - Reward experimentation
   - Track discovery progress
   - Show % of recipes found

**Example Hint Progression**:
- Attempt 1: "The elements resist alignment..."
- Attempt 2: "Fire essence might be the key..."
- Attempt 3: "Try combining Fire Essence with Crystal Dust"

---

### 15. End-Game Loop & New Game+
**Effort**: High | **Impact**: Very High | **Timeline**: 4-6 weeks

**Description**: Add infinite progression for veteran players.

**Features**:

1. **Ascension Tiers** (Beyond normal prestige):
   - Tier 1: Normal prestige (current)
   - Tier 2: Greater Ascension (10+ prestiges) - new EK bonuses
   - Tier 3: Transcendence (50+ prestiges) - unlock new mechanics
   - Tier 4: Apotheosis (100+ prestiges) - infinite scaling

2. **Challenge Runs**:
   - No clicking mode
   - Limited workstations
   - Speed run challenges
   - Random element per prestige
   - Reward: Unique achievements + cosmetics

3. **Prestige Milestones**:
   - 10th prestige: Unlock respec
   - 25th prestige: Unlock hybrid specialization
   - 50th prestige: Unlock transcendence
   - 100th prestige: Unlock secret ending

4. **Infinite Scaling**:
   - Workstation levels beyond initial unlock
   - Diminishing returns curve
   - Leaderboard for highest AB achieved

---

## 🎨 UI/UX Improvements

### 16. Design System Documentation
**Effort**: Low | **Impact**: Medium | **Timeline**: 1 week

**Description**: Document design patterns and create component library.

**Components**:
1. Create `DESIGN_SYSTEM.md`
2. Document color palette usage
3. Document spacing scale
4. Document typography hierarchy
5. Create Figma/design file
6. Storybook for component showcase

**Benefits**:
- Consistency across UI
- Faster development
- Easier onboarding
- Better maintenance

---

### 17. Accessibility Enhancements
**Effort**: Medium | **Impact**: High | **Timeline**: 2-3 weeks

**Current**: Basic WCAG compliance
**Target**: WCAG AA+ compliance

**Improvements**:

1. **Accessibility Settings Panel**:
   - Font size controls (small, medium, large, extra large)
   - Color blind modes (deuteranopia, protanopia, tritanopia)
   - High contrast mode toggle
   - Animation speed control
   - Screen reader optimization toggle

2. **Keyboard Navigation**:
   - Tab order optimization
   - Visible focus indicators (improve contrast)
   - Keyboard shortcuts guide
   - Skip navigation links

3. **Color Blind Support**:
   - Test with color blind simulators
   - Use patterns in addition to color
   - Add color blind friendly palette

4. **Screen Reader Improvements**:
   - Better ARIA labels
   - Live regions for dynamic content
   - Meaningful alt text
   - Skip to content links

**Testing**:
- Axe DevTools audit
- NVDA/JAWS screen reader testing
- Color blind simulator testing
- Keyboard-only navigation testing

---

### 18. Information Architecture Redesign
**Effort**: Medium | **Impact**: Medium | **Timeline**: 2-3 weeks

**Current Issues**:
- 7 tabs may be overwhelming
- No visual hierarchy
- Equal weight for all features

**Solutions**:

1. **Tab Categorization**:
   - **Core**: Main Game, Workstations, Inscriptions
   - **Progress**: Inventory, Experiments, Stats
   - **Meta**: Boons, Dailies, Meditation

2. **Collapsible Sidebar** (Mobile):
   - Hamburger menu for mobile
   - Persistent on desktop
   - Smooth transitions

3. **Tab Icons**:
   - Add icon for each tab
   - Improve scannability
   - Visual consistency

4. **Progressive Disclosure**:
   - Hide advanced tabs until unlocked
   - Tutorial highlights unlocked features
   - Smooth transition animations

**Mockup Needed**: Wireframe new layout before implementation.

---

### 19. Performance Budget System
**Effort**: Low | **Impact**: Medium | **Timeline**: 1 week

**Description**: Set and enforce performance budgets.

**Budgets**:
- **JavaScript Bundle**: 500 KB (minified + gzipped)
- **CSS Bundle**: 100 KB (minified + gzipped)
- **Images**: 5 MB total (optimized)
- **Fonts**: 100 KB (woff2 format)
- **Total Page Load**: < 2 seconds on 3G

**Monitoring**:
- Lighthouse CI in GitHub Actions
- Bundle size tracking
- Performance regression alerts
- Core Web Vitals monitoring

**Implementation**:
1. Set up bundlesize package
2. Add to CI/CD
3. Configure Lighthouse CI
4. Add performance dashboard
5. Monitor Core Web Vitals

---

## 📅 Implementation Timeline

### Quarter 1 (Months 1-3)
**Focus**: Foundation & Polish

- ✅ Week 1-2: E2E Testing Framework
- ✅ Week 3-4: Design System Documentation
- ✅ Week 5-6: Performance Budget System
- ✅ Week 7-8: Element Specialization Improvements
- ✅ Week 9-10: Experiment System Improvements
- ✅ Week 11-12: Accessibility Enhancements

### Quarter 2 (Months 4-6)
**Focus**: Content & Community

- ✅ Week 1-2: Meta-Progression System
- ✅ Week 3-4: End-Game Loop & New Game+
- ✅ Week 5-6: Community Platform Setup
- ✅ Week 7-8: Lightweight Social Features
- ✅ Week 9-10: Internationalization Framework
- ✅ Week 11-12: Ethical Monetization Implementation

### Quarter 3 (Months 7-9)
**Focus**: Platform Expansion

- ✅ Week 1-4: Steam Release Preparation
- ✅ Week 5-8: Mobile App Store Preparation
- ✅ Week 9-12: Live Operations Framework

### Quarter 4 (Months 10-12)
**Focus**: Advanced Features

- ✅ Week 1-6: Multiplayer & Coven System Revival
- ✅ Week 7-10: Modding API Development
- ✅ Week 11-12: Brand & IP Development Planning

---

## 🎯 Success Metrics

Track these metrics to measure success:

**Technical Metrics**:
- Test coverage: >70%
- Bundle size: <500 KB
- Lighthouse score: >90
- Accessibility score: 100

**Player Metrics**:
- Day 1 retention: >40%
- Day 7 retention: >20%
- Average session: >15 minutes
- Conversion to supporter: >5%

**Community Metrics**:
- Discord members: 1,000+
- Wiki page views: 10,000/month
- Subreddit subscribers: 500+
- Active contributors: 20+

---

## 📝 Notes

### Prioritization Framework
Use this framework to prioritize new features:

**Score = (Impact × 3) + (Feasibility × 2) - (Effort × 1)**

- Impact: 1-10 (player value)
- Feasibility: 1-10 (technical ease)
- Effort: 1-10 (time required)

**Priority Levels**:
- Score >25: Critical
- Score 20-25: High
- Score 15-20: Medium
- Score <15: Low

### Feedback Loop
- Review this document quarterly
- Update based on player feedback
- Adjust priorities as needed
- Archive completed items

### Resources
- [Game Dev Reddit](https://www.reddit.com/r/gamedev)
- [Incremental Games Reddit](https://www.reddit.com/r/incremental_games)
- [Game Design Patterns](https://gameprogrammingpatterns.com/)
- [Web.dev Best Practices](https://web.dev/)

---

**Document maintained by**: Development Team
**Last review**: 2025-11-08
**Next review**: 2026-02-08
