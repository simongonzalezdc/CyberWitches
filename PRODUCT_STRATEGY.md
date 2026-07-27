# Product Strategy & Go-to-Market Plan
## Hex Compiler - Product Management Roadmap

**Last Updated**: 2026-07-27
**Document Owner**: Product Team
**Status**: Living — Capture the heal shipped; **Restoration Kernel live**; **v1.1.0 overall S+ O2** (PRs #26–#58)

This document outlines the complete product strategy, market positioning, user acquisition plan, and business model for Hex Compiler. This is designed for team collaboration and strategic planning.

### 2026-07 active strategy

| Decision | Detail |
|----------|--------|
| Differentiator | UI-state scoreboard: broken → **SYSTEM_RESTORE**, not cyber-skin alone |
| Domain core | **Restoration Kernel** — cast/fade/ownership coalesce + pipeline roles + affinity; guides in `guides/restoration-kernel/` |
| Share artifact | Still-first sanitized split PNG + text (`SHARE_RESTORE`); no full save |
| Mute-first | Ceremony shipped; **human** field mute-clip n=5 remains growth ops gate for paid UA |
| Funnel | Local TTA / TTH / shareAttempt only (`cw.funnel.*`) |
| Pivot | 30-day clock from visual share on main; N default **50**; miss → stop virality spend |
| Kill list (90d) | No gacha / third currency / dual quest HUD / CSS framework swap / dual cast-fade writers / Steam-before-D1 |
| Quality | Overall S+ O2 (Eng∩Product∩Systems∩Identity): `guides/restoration-kernel/QUALITY_BAR.md` + `QUALITY_REPORT.md` |
| Artifacts | Kernel: `guides/restoration-kernel/`; Capture-the-heal (historical): `.scratch/capture-the-heal/` |

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Market Analysis](#market-analysis)
3. [Product Positioning](#product-positioning)
4. [Target Audience](#target-audience)
5. [Go-to-Market Strategy](#go-to-market-strategy)
6. [User Acquisition Plan](#user-acquisition-plan)
7. [Retention Strategy](#retention-strategy)
8. [Monetization Strategy](#monetization-strategy)
9. [Analytics & Metrics](#analytics--metrics)
10. [Competitive Analysis](#competitive-analysis)
11. [Product Roadmap](#product-roadmap)
12. [Platform Strategy](#platform-strategy)
13. [Community Building](#community-building)
14. [Brand Development](#brand-development)
15. [Success Criteria](#success-criteria)

---

## 📊 Executive Summary

### The Opportunity

**Market**: The idle/incremental game market generates $3B+ annually and is growing 15% YoY. Web-based games have low friction for user acquisition and can scale to millions of players with proper execution.

**Our Advantage**: Hex Compiler combines proven incremental game mechanics with innovative narrative design (the "Fading" theme) and unique progressive UI system (Design Tier glitch effects). We have a technically excellent foundation ready for market.

### Current Status
- **Development Stage**: Production-ready MVP (v1.0)
- **Technical Quality**: 8.5/10
- **Content Depth**: 7/10 (needs mid/end-game expansion)
- **Market Readiness**: 6/10 (needs optimization & strategy)

### Immediate Goals (Next 90 Days) — revised 2026-07
1. **Complete mute-clip field n=5** (runbook frozen; growth spend blocked until Pass/Soft-pass)
2. **Run 30-day share pivot** (N=50 visual shares from 2026-07-27; see `.scratch/capture-the-heal/PIVOT_REBASELINE.md`)
3. **Keep kill-list** (no gacha / dual HUD / Steam-before-D1) while measuring heal share
4. **Creator seed demos** using documented console path only (`CREATOR_SEED.md`)
5. **Local funnel only** — do not ship remote analytics sprawl until pivot passes

### 12-Month Vision
- **100,000+ total players**
- **10,000+ MAU** with 30%+ D1 retention
- **Community of 1,000+** engaged Discord members
- **Platform expansion** to Steam and mobile
- **Sustainable monetization** supporting continued development

---

## 🎯 Market Analysis

### Industry Overview

**Incremental/Idle Game Market**:
- **Market Size**: $3.2B annually (2024)
- **Growth Rate**: 15% YoY
- **Platform Distribution**: 60% mobile, 25% web, 15% PC (Steam)
- **Key Demographics**: 18-35 male (65%), 35+ growing segment (30%)

**Web Games Market**:
- **Advantages**: Zero friction acquisition, viral potential, cross-platform
- **Challenges**: Monetization harder than mobile, discovery challenges
- **Opportunity**: PWA technology enables app-like experience without app stores

### Market Trends

**Growing Trends** (Opportunities):
1. ✅ **Narrative-driven idle games** - Players want story, not just numbers
2. ✅ **Complex progression systems** - Depth > simplicity for engaged players
3. ✅ **Cross-platform play** - Cloud saves across devices expected
4. ✅ **Ethical monetization** - Players reject pay-to-win, embrace fair models
5. ✅ **Community features** - Social elements drive retention

**Declining Trends** (Threats):
1. ❌ **Simple clickers** - Saturated market, low retention
2. ❌ **Aggressive monetization** - Players avoid exploitative games
3. ❌ **Mobile-only** - Missing web/PC audience

**Our Alignment**: Hex Compiler aligns with 5/5 growing trends and avoids declining trends.

---

## 🎨 Product Positioning

### Positioning Statement

**For** hardcore incremental game fans **who** want deep, replayable progression systems with narrative depth, **Hex Compiler** is a **web-based idle game** that **combines innovative thematic design with sophisticated mechanics**. Unlike **Cookie Clicker or Idle Champions**, our product **offers a unique "fading magic" narrative that evolves the UI as you progress, creating an immersive journey of restoration**.

### Unique Selling Propositions (USPs)

1. **Progressive UI Evolution** (Design Tier System)
   - UI "stabilizes" as you preserve magic
   - 8 glitch effects that gradually disappear
   - Visual storytelling through interface
   - **Differentiation**: No other incremental game does this

2. **Deep Element Specialization System**
   - 4 distinct elemental paths (Fire, Water, Air, Crystal)
   - Meaningful strategic choices on prestige
   - High replayability through different builds
   - **Differentiation**: More depth than typical prestige systems

3. **Genre-Blending Meditation Mini-Game**
   - Tower defense within idle game
   - Active gameplay for engaged players
   - Optional but rewarding
   - **Differentiation**: Unique hybrid gameplay

4. **Privacy-First, Ethical Design**
   - No ads (initially)
   - No pay-to-win
   - Respects player time (offline progress)
   - Open about monetization
   - **Differentiation**: Trust-building in exploitative market

5. **Technical Excellence**
   - PWA = works offline
   - Cross-device cloud saves
   - Accessibility built-in
   - Fast, optimized performance
   - **Differentiation**: Professional quality vs hobbyist competition

### Positioning Grid

```
                    High Complexity
                          ↑
                          |
           NGU Idle       |    Hex Compiler ⭐
                          |    Realm Grinder
                          |
Casual ←------------------|------------------→ Hardcore
                          |
        Cookie Clicker    |    Idle Champions
        AdVenture        |    Melvor Idle
        Capitalist       |
                          |
                          ↓
                    Low Complexity
```

**Our Position**: High complexity, hardcore-leaning, but accessible to intermediates.

---

## 👥 Target Audience

### Primary Persona: "The Optimizer"

**Demographics**:
- Age: 25-35
- Gender: Male (65%), Female (35%)
- Location: US, EU, Canada (English-speaking initially)
- Occupation: Tech workers, students, remote workers
- Income: $40K-80K (disposable income for gaming)

**Psychographics**:
- Loves spreadsheets and optimization
- Plays during work (idle games fit lifestyle)
- Active in gaming communities (Reddit, Discord)
- Values depth over graphics
- Willing to support indie devs
- Skeptical of pay-to-win

**Gaming Behavior**:
- Plays multiple idle games simultaneously
- Daily sessions: 3-5 per day, 10-30 minutes each
- Lifetime value: 3-6 months of engagement
- Likely to share discoveries and strategies
- Values community guides and wikis

**Pain Points**:
- Most idle games too simple or too exploitative
- Wants depth without overwhelming complexity
- Frustrated by pay-to-win mechanics
- Desires cross-device play
- Craves fresh mechanics in stale genre

**How Hex Compiler Solves**:
- ✅ Deep progression without pay-to-win
- ✅ Unique mechanics (design tier, element specialization)
- ✅ Ethical monetization
- ✅ Cloud saves for cross-device
- ✅ Community-first approach

### Secondary Persona: "The Casual Enjoyer"

**Demographics**:
- Age: 18-45 (wider range)
- Gender: More balanced
- Occupation: Various
- Income: Lower priority (free-to-play)

**Psychographics**:
- Plays casually, doesn't optimize
- Enjoys "numbers go up" satisfaction
- Less community-engaged
- Shorter attention span
- Values low commitment

**Gaming Behavior**:
- Plays 1-2 idle games
- Sessions: Once daily or less
- Lifetime: 2-4 weeks
- Unlikely to share or contribute
- Values simplicity

**How Hex Compiler Serves**:
- ⚠️ May find too complex initially
- ✅ Tutorial and onboarding will help
- ✅ Offline progress respects casual play
- ✅ No pressure to optimize
- ✅ Satisfying core loop

**Strategy**: Focus on Primary Persona, serve Secondary through good onboarding.

---

## 🚀 Go-to-Market Strategy

### Launch Phases

#### Phase 1: Soft Launch (Months 1-2)
**Goal**: Validate product-market fit, gather feedback, iterate

**Target**: 1,000-5,000 players
**Channels**:
- r/incremental_games (high-quality audience)
- Personal networks
- Indie game forums

**Activities**:
1. Week 1: Launch on itch.io (free)
2. Week 1: Post on r/incremental_games with dev story
3. Week 2: Gather feedback, fix critical bugs
4. Week 3-4: Iterate based on feedback
5. Week 5-8: Optimize retention based on analytics

**Success Criteria**:
- 40%+ D1 retention
- 20%+ D7 retention
- Average session >10 minutes
- <5% critical bug reports
- Positive community sentiment (>80% upvote ratio)

#### Phase 2: Public Launch (Months 3-4)
**Goal**: Scale user acquisition, establish presence

**Target**: 10,000-25,000 players
**Channels**:
- Major game journalism sites
- YouTube influencers (incremental game niche)
- Reddit (multiple subreddits)
- Product Hunt launch

**Activities**:
1. Week 1: Press release to indie game sites
2. Week 1: Product Hunt launch
3. Week 2: YouTube influencer outreach (5-10 creators)
4. Week 3: Reddit AMA on r/incremental_games
5. Week 4: Content marketing (blog posts, guides)
6. Ongoing: Community management and support

**Success Criteria**:
- 10,000+ total players
- 2,000+ MAU
- Featured on Product Hunt
- 2+ YouTube videos (50K+ combined views)
- Active Discord community (200+ members)

#### Phase 3: Platform Expansion (Months 5-8)
**Goal**: Reach new audiences, increase monetization

**Target**: 50,000-100,000 players
**Channels**:
- Steam (PC/Mac/Linux)
- Mobile app stores (iOS/Android)
- Major web game portals (Kongregate, Armor Games)

**Activities**:
1. Month 5: Steam store page + wishlist campaign
2. Month 6: Steam launch + sale
3. Month 7: Mobile app store submissions
4. Month 8: Mobile launch + cross-promotion

**Success Criteria**:
- 50,000+ total players across all platforms
- 1,000+ Steam wishlists before launch
- 500+ Steam reviews (>80% positive)
- Featured on mobile app stores
- 5,000+ MAU across all platforms

#### Phase 4: Scale & Optimize (Months 9-12)
**Goal**: Sustainable growth, optimize monetization

**Target**: 100,000+ players
**Channels**:
- Paid advertising (if ROI positive)
- Influencer partnerships
- Community growth
- Content updates

**Activities**:
1. Months 9-10: Paid UA campaigns (test channels)
2. Month 11: Major content update (seasonal event)
3. Month 12: Year in review, community celebration

**Success Criteria**:
- 100,000+ total players
- 10,000+ MAU
- Positive ROI on paid advertising
- Self-sustaining through monetization
- Thriving community (1,000+ Discord members)

---

## 📈 User Acquisition Plan

### Channel Strategy

#### 1. Reddit (Primary Channel - Months 1-3)
**Subreddits**:
- r/incremental_games (170K members) - PRIMARY
- r/WebGames (1.3M members)
- r/IndieGaming (590K members)
- r/gaming (36M members) - if content goes viral

**Tactics**:
- Authentic dev post with game story
- Weekly update posts (progress, features)
- Engage with comments authentically
- Share interesting stats/milestones
- AMA when game reaches milestones

**Budget**: $0 (organic only)
**Expected CAC**: $0
**Expected Users**: 5,000-15,000

**Content Ideas**:
- "I built an idle game where the UI breaks as magic fades"
- Weekly: "Hex Compiler Dev Log #X - [Feature]"
- "We just hit 10K players! Here's what we learned"

#### 2. YouTube Influencers (Months 2-4)
**Target Channels**:
- Incremental game reviewers (10K-100K subs)
- Indie game showcases
- Web game reviewers

**Outreach List** (Research specific creators):
- Wanderbots (idle game content)
- DavidAngel64 (indie game reviews)
- Let's Game It Out (if game has funny edge cases)

**Tactics**:
- Personalized email outreach
- Provide press kit + dev build
- Offer early access to new features
- No payment (organic), but offer creator code for monetization share

**Budget**: $0 initial, potential revenue share later
**Expected CAC**: $0
**Expected Users**: 10,000-50,000 (if 2-3 videos hit)

**Email Template**:
```
Subject: Hex Compiler - Idle game with progressive UI corruption

Hi [Name],

I'm [Your Name], developer of Hex Compiler, a new idle/incremental game
with a unique twist: as you preserve fading magic, the glitchy UI
gradually stabilizes. It's Cookie Clicker meets cyberpunk aesthetics.

I think your audience would enjoy the [depth/humor/innovation] -
especially [specific feature relevant to their content].

Press kit: [link]
Play here: [link]

No pressure! If it's not a fit, totally understand.

Best,
[Your Name]
```

#### 3. Product Hunt (Month 3)
**Preparation** (4 weeks before launch):
- Build hunter outreach list
- Prepare assets (screenshots, GIFs, video)
- Schedule launch for Tuesday-Thursday
- Rally existing community for launch day
- Prepare to respond to all comments

**Launch Day Tactics**:
- Post at 12:01 AM PST
- Developer AMA in comments
- Share to social media
- Email existing players to upvote
- Cross-post to relevant communities

**Budget**: $0
**Expected CAC**: $0
**Expected Users**: 2,000-10,000 (if featured)
**Expected Press**: 5-10 blog posts if #1-3 product of day

#### 4. Indie Game Press (Months 3-4)
**Target Outlets**:
- IndieGames.com
- RockPaperShotgun (Free Loaders section)
- PC Gamer (Free Games roundup)
- Kotaku
- Polygon
- Gamasutra

**Tactics**:
- Press release with compelling hook
- Press kit with assets
- Personalized pitches
- Exclusive feature offers

**Budget**: $0
**Expected CAC**: $0
**Expected Users**: 5,000-25,000 (if 2-3 outlets cover)

**Press Release Hook Ideas**:
- "Idle game with UI that breaks and repairs as you play"
- "The incremental game that tells a story through glitches"
- "Free web game combines idle mechanics with tower defense"

#### 5. Web Game Portals (Months 4-6)
**Portals**:
- itch.io (soft launch)
- Kongregate
- Armor Games
- Newgrounds
- CrazyGames

**Tactics**:
- Submit to all portals
- Optimize for each platform
- Cross-promote between platforms
- Respond to all reviews
- Update regularly

**Budget**: $0 (rev share with portals)
**Expected CAC**: $0
**Expected Users**: 10,000-50,000 cumulative

#### 6. Steam (Months 5-6)
**Pre-Launch** (6-8 weeks):
- Store page optimization
- Wishlist campaign
- Steam-specific features (achievements, cards)
- Beta testers from community

**Launch**:
- Launch discount (10-20%)
- Email wishlist holders
- Press outreach
- Community event

**Budget**: $100 (Steam Direct fee)
**Expected CAC**: $0.10-0.50
**Expected Users**: 20,000-100,000 (over time)

#### 7. Mobile App Stores (Months 7-8)
**Pre-Launch**:
- App Store Optimization (ASO)
- Screenshots and preview video
- Beta testing (TestFlight/Google Play)
- Pre-registration campaign (Android)

**Launch**:
- Featured placement pitch
- Launch PR
- Cross-promotion with web/Steam
- ASO optimization

**Budget**: $124 ($99 Apple + $25 Google)
**Expected CAC**: $0.50-2.00 (organic)
**Expected Users**: 50,000-200,000 (over time)

#### 8. Paid Advertising (Months 9-12, if ROI positive)
**Channels to Test**:
- Reddit Ads (r/incremental_games targeting)
- Google Display Network (game sites)
- Facebook/Instagram (lookalike audiences)
- YouTube pre-roll (gaming content)

**Budget**: $500-2,000/month (test small, scale if ROI >1.5x)
**Expected CAC**: $1-5
**Expected Users**: Depends on budget and CAC

**Test Framework**:
1. Start with $500 budget across 3 channels
2. Track CAC, LTV, retention by channel
3. Kill underperforming channels
4. Scale performing channels
5. Target LTV:CAC ratio >3:1

---

## 🔄 Retention Strategy

### Current State
**Unknown** - Need to implement analytics first.

**Target Metrics**:
- D1 (Day 1) Retention: 40%+
- D7 (Day 7) Retention: 20%+
- D30 (Day 30) Retention: 10%+

### Retention Drivers

#### 1. Daily Rituals (Existing Feature)
**Current**: Daily tasks system exists
**Improvements Needed**:
- More variety in daily tasks
- Better rewards
- Streak bonuses
- Daily login bonuses

**Enhanced Daily Login Rewards**:
```
Day 1: 100 AB
Day 2: 200 AB
Day 3: Rare ingredient pack
Day 4: 500 AB
Day 5: Production boost (2 hours)
Day 6: 1,000 AB
Day 7: Prestige boost + 2,000 AB
(Then repeats with scaling rewards)
```

#### 2. Weekly Challenges (New Feature)
**Implementation**: Phase 2

**Examples**:
- "Earn 10,000 AB this week" → Reward: 1,000 AB bonus
- "Craft 50 workstations" → Reward: Random rare ingredient
- "Prestige once" → Reward: 5 EK bonus
- "Reach combo 100" → Reward: Achievement + cosmetic

#### 3. Seasonal Events (New Feature)
**Implementation**: Phase 3

**Event Calendar**:
- Q1 (Jan-Mar): Winter Solstice Event
- Q2 (Apr-Jun): Spring Awakening Event
- Q3 (Jul-Sep): Summer Arcana Event
- Q4 (Oct-Dec): Harvest Moon Event

**Event Features**:
- Limited-time workstations
- Exclusive ingredients
- Event-specific achievements
- Cosmetic rewards
- Leaderboards

**Duration**: 2-3 weeks per event
**Frequency**: Every 3 months

#### 4. Meta-Progression (New Feature)
**Implementation**: Phase 3

**Systems**:
- Mastery levels for workstations
- Collection completion bonuses
- Legacy achievements
- Research tree

**Purpose**: Give long-term players goals beyond prestige.

#### 5. Social Features (New Feature)
**Implementation**: Phase 2-3

**Features**:
- Global leaderboards
- Share achievements
- Friend codes
- Coven system (Phase 4)

**Purpose**: Social obligation drives daily return.

#### 6. Content Updates (Ongoing)
**Cadence**: Monthly small updates, quarterly major updates

**Update Types**:
- New workstations
- New recipes
- Balance changes
- QoL improvements
- Bug fixes

**Communication**:
- In-game changelog
- Discord announcements
- Reddit dev logs
- Email newsletter

### Retention Recovery Tactics

#### Re-Engagement (Lapsed Users)
**Definition**: Users who haven't logged in for 7+ days

**Tactics**:
1. **Email Campaign** (if opt-in):
   - Day 7: "We miss you! Here's what's new"
   - Day 14: "Your magic is fading faster! Come back"
   - Day 30: "Last chance! Special return bonus"

2. **Return Bonuses**:
   - 7-day absence: 2x offline progress
   - 14-day absence: Free rare ingredient pack
   - 30-day absence: Small EK bonus

3. **Push Notifications** (PWA/Mobile):
   - "Your workstations have produced [X] AB!"
   - "New seasonal event started!"
   - "Your daily ritual is ready!"

---

## 💰 Monetization Strategy

### Philosophy
**Ethical, Player-First Monetization**

**Core Principles**:
1. ✅ Never pay-to-win
2. ✅ Respect player time (no energy systems)
3. ✅ Transparent pricing
4. ✅ Generous free experience
5. ✅ Optional, not required
6. ✅ Support development, don't exploit

### Monetization Timeline

**Phase 1 (Months 1-3): Free, No Ads**
- Focus on growth and retention
- Build trust with community
- Gather feedback
- Validate product-market fit

**Phase 2 (Months 4-6): Soft Monetization**
- Optional supporter tier
- Cosmetic purchases
- Premium cloud saves
- No pressure, just opportunity

**Phase 3 (Months 7-12): Optimized Monetization**
- Expanded cosmetic store
- Seasonal content passes
- Platform-specific pricing (Steam/Mobile)
- Ongoing optimization

### Revenue Models

#### Option 1: Supporter Tier (Recommended)
**Price**: $5 one-time OR $2/month subscription

**Benefits**:
- ✅ Exclusive cosmetic themes (5+ themes)
- ✅ Unique particle effects (10+ effects)
- ✅ Supporter badge
- ✅ Cloud save (unlimited save slots vs 1 free)
- ✅ Early access to new features (1 week early)
- ✅ Access to supporter Discord channel
- ✅ Name in credits

**Conversion Goal**: 5% of active players

**Projected Revenue** (10,000 MAU):
- 5% conversion = 500 supporters
- One-time: 500 × $5 = $2,500
- Subscription: 500 × $2/mo = $1,000/month

**Churn Mitigation**:
- New themes monthly
- Regular content updates
- Supporter-exclusive events
- Community appreciation

#### Option 2: À La Carte Cosmetics
**Products**:
- Individual themes: $1-2 each
- Particle effect packs: $1-3 each
- Sound pack alternatives: $1 each
- Seasonal cosmetic bundles: $5-10

**Conversion Goal**: 10% of active players make at least one purchase

**Projected Revenue** (10,000 MAU):
- 10% conversion = 1,000 buyers
- Average purchase: $3
- Total: $3,000 one-time (+ repeat purchases)

#### Option 3: Platform-Specific Pricing
**Steam**:
- Base game: $4.99 (includes all supporter tier benefits)
- OR Free-to-play with DLC (Supporter Pack $5)

**Mobile**:
- Free with IAP (Supporter Tier as IAP)
- OR Premium ($2.99) with no IAP

**Recommendation**: Free + IAP for reach, premium as alternative.

#### Option 4: Donation/Tip Jar
**Platforms**:
- Ko-fi integration
- Patreon tiers
- GitHub Sponsors

**Benefits**:
- Low friction
- Player feels good
- No promised features

**Projected Revenue**: $100-500/month (highly variable)

### Recommended Hybrid Model

**Web Version**:
- Free to play
- Supporter Tier ($2/month or $5 one-time)
- À la carte cosmetics
- Ko-fi tip jar

**Steam Version**:
- $4.99 premium (includes Supporter Tier benefits)
- OR Free with Supporter Pack DLC

**Mobile Version**:
- Free to play
- In-app purchases (Supporter Tier, cosmetics)

### What NOT to Monetize (Ethical Boundaries)

❌ **Never**:
- Gameplay advantages
- Faster progression (besides offline progress)
- Exclusive workstations/upgrades
- Additional save slots (1 free is minimum)
- Removing timers (we don't have them)
- Energy systems (we don't have them)
- Loot boxes / gacha
- Ads (unless opt-in rewarded ads)

### Monetization Metrics to Track

**Key Metrics**:
- ARPU (Average Revenue Per User)
- ARPPU (Average Revenue Per Paying User)
- Conversion Rate (% of users who pay)
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)
- LTV:CAC Ratio (target: >3:1)
- Churn rate (subscription)
- Repeat purchase rate

**Target Benchmarks**:
- Conversion Rate: 5-10%
- ARPPU: $3-10
- LTV: $0.50-1.00 (free users), $5-20 (paying users)
- LTV:CAC: >3:1

---

## 📊 Analytics & Metrics

### Analytics Stack

#### Primary: Privacy-Friendly Analytics
**Recommended Tool**: Plausible Analytics OR Umami

**Why**:
- GDPR compliant
- No cookies
- Respects privacy
- Lightweight
- Affordable ($9-19/month)

**Alternative**: Self-hosted Matomo

#### Event Tracking
**Tool**: Custom implementation + Plausible Events

**Events to Track**:

**Acquisition**:
- `page_view` - Entry point
- `referrer` - Traffic source
- `campaign` - UTM tracking

**Activation** (First Session):
- `first_cast` - First spell cast
- `first_workstation` - First workstation crafted
- `tutorial_complete` - Tutorial completed
- `first_prestige` - First prestige completed

**Engagement**:
- `session_start` - Session began
- `session_end` - Session ended
- `tab_switch` - Changed tabs
- `daily_ritual_complete` - Completed daily task
- `achievement_unlocked` - Achievement earned

**Retention**:
- `day_1_return` - Returned on day 1
- `day_7_return` - Returned on day 7
- `day_30_return` - Returned on day 30
- `weekly_challenge_complete` - Weekly challenge

**Monetization**:
- `supporter_tier_view` - Viewed supporter page
- `supporter_tier_purchase` - Purchased supporter tier
- `cosmetic_purchase` - Purchased cosmetic
- `refund` - Refund issued

**Virality**:
- `share_clicked` - Clicked share button
- `achievement_shared` - Shared achievement
- `friend_code_created` - Created friend code

### Metrics Dashboard

**Daily Metrics**:
- DAU (Daily Active Users)
- New Users
- Retention (D1, D7, D30)
- Average Session Length
- Sessions per User
- Revenue

**Weekly Metrics**:
- WAU (Weekly Active Users)
- Week-over-week growth
- Cohort retention
- Feature adoption rates
- Top acquisition channels
- Conversion funnel

**Monthly Metrics**:
- MAU (Monthly Active Users)
- MRR (Monthly Recurring Revenue)
- Churn rate
- LTV
- CAC
- LTV:CAC ratio
- NPS (Net Promoter Score)

### A/B Testing Framework

**Phase 1 (Months 4+)**: Simple A/B tests

**Tests to Run**:

1. **Onboarding Flow**:
   - A: Current tutorial
   - B: Interactive step-by-step
   - Metric: Tutorial completion rate

2. **First Prestige Prompt**:
   - A: Modal at 100 AB
   - B: Modal at 50 AB
   - C: No modal, button only
   - Metric: Time to first prestige

3. **Daily Ritual Rewards**:
   - A: Current rewards
   - B: 2x rewards
   - C: 0.5x rewards but more frequent
   - Metric: Daily return rate

4. **Supporter Tier Pricing**:
   - A: $2/month
   - B: $5 one-time
   - C: $3/month
   - Metric: Conversion rate, revenue

**Tool**: Custom implementation or Optimizely

---

## 🏆 Competitive Analysis

### Direct Competitors

#### 1. Cookie Clicker
**Strengths**:
- Name recognition (pioneer)
- Simple, accessible
- Massive content depth
- Active development

**Weaknesses**:
- Dated UI
- No narrative
- Very simple mechanics
- No mobile optimization

**Our Advantage**:
- ✅ Modern UI/UX
- ✅ Strong narrative theme
- ✅ Deeper progression systems
- ✅ PWA mobile support

#### 2. NGU Idle
**Strengths**:
- Extremely deep progression
- Huge content volume
- Strong community
- Regular updates

**Weaknesses**:
- Overwhelming complexity
- Confusing UI
- Poor onboarding
- Dated graphics

**Our Advantage**:
- ✅ Better onboarding
- ✅ Modern design
- ✅ Clearer progression
- ✅ Thematic coherence

#### 3. Realm Grinder
**Strengths**:
- Deep faction system
- High replayability
- Good prestige mechanics
- Active community

**Weaknesses**:
- Complex meta
- Slow early game
- Minimal theme
- Flash-based (dated)

**Our Advantage**:
- ✅ Modern web tech
- ✅ Better pacing
- ✅ Stronger theme
- ✅ Element specialization system

#### 4. Melvor Idle
**Strengths**:
- Runescape-like depth
- Offline progress
- Skill system
- Mobile app

**Weaknesses**:
- Generic fantasy theme
- No narrative
- Slow progression
- Complex for newcomers

**Our Advantage**:
- ✅ Unique cyberpunk/witchy theme
- ✅ Narrative depth
- ✅ Better pacing
- ✅ More accessible

### Competitive Positioning Matrix

| Game | Complexity | Theme | Monetization | Mobile | Our Edge |
|------|-----------|-------|--------------|--------|----------|
| Cookie Clicker | Low | Minimal | Ethical | Poor | Theme, depth, mobile |
| NGU Idle | Very High | Minimal | Ethical | Good | UX, accessibility |
| Realm Grinder | High | Weak | Ethical | Good | Theme, modern tech |
| Melvor Idle | High | Generic | Ethical | Excellent | Theme, pacing |
| **Hex Compiler** | **Medium-High** | **Strong** | **Ethical** | **Good** | **Unique mechanics** |

### Market Gap We Fill

**The Opportunity**:
Incremental game players want:
1. Depth of NGU Idle
2. Accessibility of Cookie Clicker
3. Theme/narrative (currently lacking in genre)
4. Modern UX (most games have dated UI)
5. Ethical monetization

**Hex Compiler delivers all 5**.

---

## 🗓️ Product Roadmap

### Quarter 1 (Months 1-3): Foundation
**Focus**: Launch, validate, iterate

**Goals**:
- Launch to 5,000+ players
- Validate product-market fit
- 40%+ D1 retention
- Active community (Discord 100+ members)

**Features**:
- ✅ Asset optimization
- ✅ Onboarding tutorial
- ✅ Analytics integration
- ✅ Balance pass
- ✅ Responsive design improvements

**Marketing**:
- Reddit launch (r/incremental_games)
- Community building
- Feedback gathering
- Iteration based on data

### Quarter 2 (Months 4-6): Growth
**Focus**: User acquisition, monetization soft launch

**Goals**:
- 10,000+ MAU
- Supporter tier launch (5% conversion)
- YouTube coverage (3+ videos)
- Product Hunt top 5

**Features**:
- Mid-game content expansion
- Cloud save implementation
- Test coverage expansion
- Element specialization improvements

**Marketing**:
- Product Hunt launch
- YouTube influencer outreach
- Press outreach
- Supporter tier launch

### Quarter 3 (Months 7-9): Platform Expansion
**Focus**: Steam & mobile launch

**Goals**:
- 50,000+ total players across platforms
- 1,000+ Steam reviews (80%+ positive)
- Mobile app store features
- $5,000+ MRR

**Features**:
- Steam integration
- Mobile optimization
- Platform-specific features
- Live operations framework

**Marketing**:
- Steam wishlist campaign
- Steam launch
- Mobile app store launch
- Cross-platform promotion

### Quarter 4 (Months 10-12): Scale & Optimize
**Focus**: Sustainable growth, content expansion

**Goals**:
- 100,000+ total players
- 10,000+ MAU
- $10,000+ MRR
- Self-sustaining business

**Features**:
- TypeScript migration
- End-game content expansion
- Seasonal events
- Multiplayer (Coven system)

**Marketing**:
- Paid advertising (if ROI positive)
- Content marketing
- Community events
- Year-end celebration

---

## 🌐 Platform Strategy

### Web (Primary Platform)

**Advantages**:
- Zero friction acquisition
- Instant play
- Cross-platform
- SEO discoverability
- Easy updates

**Challenges**:
- Monetization harder
- Discovery harder
- Less "premium" perception

**Hosting**:
- Primary: Vercel/Netlify (free tier → paid as needed)
- CDN: Cloudflare (free)
- Domain: hex-compiler.game ($12/year)

**SEO Strategy**:
- Title: "Hex Compiler - Free Idle/Incremental Game"
- Meta description: "Preserve fading magic in this unique idle game. Deep progression, ethical design, play in browser."
- Keywords: incremental game, idle game, browser game, free game

### itch.io (Soft Launch Platform)

**Why itch.io**:
- Indie-friendly
- Quick to publish
- Good community
- Pay-what-you-want option
- Analytics built-in

**Strategy**:
- Launch ASAP for soft launch
- Gather feedback
- Build initial community
- Test monetization (pay-what-you-want)

### Steam (Months 5-6)

**Pricing**:
- Option A: $4.99 premium
- Option B: Free-to-play with Supporter Pack DLC ($5)

**Recommendation**: Option B for wider reach

**Features to Add**:
- Steam achievements (sync with in-game)
- Steam cloud saves
- Trading cards (if eligible)
- Workshop support (mods, Phase 2)

**Marketing**:
- 6-8 week wishlist campaign
- Streamer keys (100+)
- Press keys (50+)
- Launch discount (10-20%)

### Mobile App Stores (Months 7-8)

**iOS App Store**:
- Free with IAP
- App Store Optimization (ASO)
- Screenshots optimized for App Store
- Preview video (30 seconds)

**Google Play Store**:
- Free with IAP
- Google Play pre-registration
- Google Play Instant (demo)
- Google Play Points integration

**ASO Strategy**:
- App Title: "Hex Compiler - Idle Magic Game"
- Keywords: idle game, incremental, magic, witch, clicker
- Screenshots: Show progression, UI evolution, features
- Video: 30-second hook → core loop → unique features

---

## 👨‍👩‍👧‍👦 Community Building

### Discord Server Structure

**Channels**:
- #announcements (read-only)
- #general
- #help-and-support
- #feedback
- #bug-reports
- #suggestions
- #showcase (player achievements)
- #guides-and-strategies
- #off-topic
- #supporter-lounge (supporter tier only)
- #developer-chat (direct dev access)

**Roles**:
- Developer (dev team)
- Moderator (trusted community)
- Supporter (paid tier)
- Beta Tester (active testers)
- Community Helper (active support)
- Member (everyone)

**Bots**:
- MEE6 or Dyno (moderation)
- Custom bot (share stats from game)
- Notification bot (new updates)

**Moderation**:
- Clear community guidelines
- 2-3 moderators (recruit from community)
- Zero tolerance for harassment
- Encourage positive vibes

### Community Programs

#### 1. Beta Testing Program
**Purpose**: Early feedback, bug hunting, community involvement

**Requirements**:
- Active player (7+ days)
- Discord member
- Provide constructive feedback

**Benefits**:
- Early access to features (1-2 weeks)
- Exclusive beta tester badge
- Name in credits
- Direct dev interaction

**Size**: 20-50 beta testers

#### 2. Community Helper Program
**Purpose**: Peer support, reduce dev support burden

**Requirements**:
- Deep game knowledge
- Active in Discord
- Helpful attitude

**Benefits**:
- Community Helper role
- Special badge in-game
- Recognition in dev logs
- Input on new features

**Size**: 5-10 helpers

#### 3. Content Creator Program
**Purpose**: Organic marketing through creators

**Support Offered**:
- Early access
- Creator codes (revenue share if monetized)
- Featured on official channels
- Direct dev communication

**Requirements**:
- Active content creation (YouTube, Twitch, blog)
- 100+ followers/subscribers
- Quality content

---

## 🎨 Brand Development

### Brand Identity

**Name**: Hex Compiler
**Tagline**: "Preserve the fading magic"
**Genre**: Idle/Incremental RPG

**Brand Personality**:
- Mystical yet modern
- Deep but accessible
- Ethical and transparent
- Community-first
- Innovative

**Visual Identity**:
- Primary colors: Cyberpunk magenta (#FF2DAA), cyan (#22E3FF)
- Typography: Orbitron (headings), Rajdhani (body)
- Aesthetic: Cyberpunk meets witchy/mystical
- Glitch effects (thematically consistent)

### Brand Assets Needed

**Logo**:
- Primary logo (horizontal)
- Icon/mark (square, for app stores)
- Variations (light/dark background)
- Formats: SVG, PNG (multiple sizes)

**Marketing Assets**:
- Social media banners
- Press kit screenshots (10+)
- App store screenshots (per platform)
- Promotional GIFs
- Feature showcase videos

**Merchandise** (Phase 2):
- T-shirts with game quotes
- Enamel pins (element symbols)
- Stickers (UI elements)
- Art prints (concept art)

### Content Marketing

**Developer Blog**:
- Weekly dev logs (process, features, behind-the-scenes)
- Monthly state of the game
- Post-mortems of major features
- Community spotlights

**Social Media** (Low priority, quality over quantity):
- Twitter: Dev updates, community retweets
- Instagram: Visual showcases, art
- Reddit: Primary community engagement
- YouTube: Feature trailers, dev vlogs

**Frequency**:
- Blog: Weekly
- Twitter: 3-5 times/week
- Instagram: 2-3 times/week
- Reddit: Daily engagement, weekly posts

---

## ✅ Success Criteria

### Phase 1 Success (Months 1-3)
- ✅ 5,000+ total players
- ✅ 1,000+ MAU
- ✅ 40%+ D1 retention
- ✅ 20%+ D7 retention
- ✅ 100+ Discord members
- ✅ >80% positive sentiment (Reddit upvotes)
- ✅ <5% critical bug rate

### Phase 2 Success (Months 4-6)
- ✅ 25,000+ total players
- ✅ 5,000+ MAU
- ✅ Product Hunt top 10
- ✅ 3+ YouTube videos (50K+ combined views)
- ✅ 5% conversion to supporter tier
- ✅ 500+ Discord members
- ✅ $2,000+ MRR

### Phase 3 Success (Months 7-9)
- ✅ 75,000+ total players
- ✅ 10,000+ MAU
- ✅ 1,000+ Steam reviews (80%+ positive)
- ✅ Featured on app stores
- ✅ $5,000+ MRR
- ✅ 1,000+ Discord members
- ✅ Positive ROI on paid advertising

### Phase 4 Success (Months 10-12)
- ✅ 150,000+ total players
- ✅ 20,000+ MAU
- ✅ $10,000+ MRR
- ✅ Self-sustaining business
- ✅ Thriving community (2,000+ Discord)
- ✅ 50+ content creators covering game
- ✅ Top 10 incremental game on Steam

### Long-Term Vision (Year 2+)
- ✅ 500,000+ total players
- ✅ 50,000+ MAU
- ✅ $25,000+ MRR
- ✅ Full-time sustainable for dev team
- ✅ Regular content updates (monthly)
- ✅ Active multiplayer community
- ✅ Recognized brand in incremental game space

---

## 📝 Action Items for Team Discussion

### Immediate Decisions Needed

1. **Monetization Model**:
   - [ ] Supporter tier structure
   - [ ] Pricing ($2/mo vs $5 one-time vs both)
   - [ ] Cosmetics strategy
   - [ ] Steam pricing (free vs $4.99)

2. **Launch Timeline**:
   - [ ] Target soft launch date
   - [ ] Public launch date
   - [ ] Steam launch date
   - [ ] Mobile launch date

3. **Resource Allocation**:
   - [ ] Who handles marketing?
   - [ ] Who handles community management?
   - [ ] Who handles monetization implementation?
   - [ ] Budget for paid advertising (if any)

4. **Analytics Platform**:
   - [ ] Choose analytics tool (Plausible vs Umami vs Matomo)
   - [ ] Define key events to track
   - [ ] Set up metrics dashboard

5. **Brand & Positioning**:
   - [ ] Finalize tagline
   - [ ] Logo design (hire designer or DIY?)
   - [ ] Press kit creation
   - [ ] Marketing asset priorities

### Discussion Questions

1. **Monetization Philosophy**:
   - How important is revenue vs player count?
   - Are we comfortable with subscriptions or prefer one-time?
   - What's our stance on ads (never, opt-in rewarded, eventual)?

2. **Scope & Timeline**:
   - What features are must-haves for public launch?
   - What can be post-launch?
   - Are we committed to 12-month roadmap?

3. **Team & Resources**:
   - Can we commit to community management time?
   - Do we have budget for tools (analytics, hosting, etc.)?
   - What's our risk tolerance on paid advertising?

4. **Platform Priorities**:
   - Web-first (low cost, high reach) vs Premium platforms (Steam, mobile)?
   - Do we have bandwidth for multi-platform?

5. **Long-Term Vision**:
   - Is this a side project or potential business?
   - 1-year horizon or 5-year?
   - Open to expanding team if successful?

---

## 📚 Resources & References

### Market Research
- [Incremental Games subreddit](https://www.reddit.com/r/incremental_games)
- [Idle Game Developer Discord](https://discord.gg/incremental)
- [Newzoo Market Reports](https://newzoo.com/)
- [Steam Database (incremental games)](https://steamdb.info/tag/idle/)

### Analytics & Tools
- [Plausible Analytics](https://plausible.io/)
- [Umami](https://umami.is/)
- [Matomo](https://matomo.org/)
- [Google Analytics for Games](https://analytics.google.com/analytics/academy/)

### Marketing Resources
- [Indie Game Marketing Guide](https://howtomarketagame.com/)
- [Reddit Marketing Guide](https://www.reddit.com/wiki/selfpromotion)
- [Product Hunt Launch Guide](https://www.producthunt.com/stories/how-to-launch-on-product-hunt)
- [ASO Academy](https://asodesk.com/blog/)

### Community Building
- [Community Management Handbook](https://www.communityroundtable.com/)
- [Discord Server Guide](https://discord.com/community)
- [Reddit Moderation Guide](https://www.reddithelp.com/hc/en-us/articles/204579879)

---

## 🔄 Document Maintenance

**Owner**: Product Team
**Created**: 2025-11-08
**Last Updated**: 2025-11-08
**Next Review**: Every 30 days

**Update Process**:
1. Monthly team review
2. Update based on new data
3. Adjust strategy as needed
4. Archive old versions
5. Communicate changes to team

---

## ✍️ Team Notes Section

**Use this space for team discussion notes, decisions made, and action items:**

### Meeting 1 (Date: _____)
**Attendees**:
**Decisions**:
**Action Items**:

### Meeting 2 (Date: _____)
**Attendees**:
**Decisions**:
**Action Items**:

---

**END OF DOCUMENT**

This strategy document is a living document. Update it regularly based on learnings, data, and market changes. Good luck with Hex Compiler! 🚀
