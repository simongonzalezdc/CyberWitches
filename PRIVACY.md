# Privacy Policy

**Effective Date**: 2025-11-08
**Last Updated**: 2025-11-08
**Version**: 1.0

## Introduction

Welcome to Hex Compiler ("we," "our," or "the game"). We are committed to protecting your privacy and being transparent about what data we collect and how we use it.

This Privacy Policy explains how Hex Compiler handles your information when you play our game.

## Data Controller

This game is operated as an open-source project. For privacy inquiries, please refer to the contact information in the game's repository.

## Data We Collect

### 1. Local Storage Data (Required for Game Function)

Hex Compiler stores game data **locally on your device** using your browser's LocalStorage. This data never leaves your device unless you explicitly use cloud save features (if implemented).

**What we store locally**:
- Game progress (resources, workstations, upgrades)
- Game settings (volume, quality preferences)
- Achievement progress
- Tutorial completion status
- Prestige count and bonuses
- Element specialization choice
- Meditation progress (if applicable)
- Daily ritual completion

**Purpose**: To save your game progress between sessions.

**Retention**: Data remains on your device until you clear your browser data or explicitly delete your save file.

**Your Control**: You can delete all game data at any time through your browser settings or the in-game "Reset All Progress" option.

### 2. Device Identifier (Local Only)

A random device ID is generated and stored locally to differentiate between multiple devices if cloud save is used. This ID:
- Is randomly generated (not based on any personal information)
- Cannot be used to identify you personally
- Is stored only on your device
- Is NOT transmitted to any server unless you use cloud save features

### 3. Analytics Data (Optional - If Enabled)

**Current Status**: Analytics are NOT currently enabled in this version.

**If analytics are enabled in future updates**, we may collect:
- Anonymized gameplay statistics (features used, progression metrics)
- Performance data (frame rate, load times)
- Error reports (crashes, bugs)

**What we DO NOT collect**:
- Personal information (name, email, address)
- IP addresses
- Precise geolocation
- Browsing history outside the game
- Data from other websites or apps
- Any personally identifiable information

**Consent**: If analytics are enabled, you will be asked for explicit consent, and you can opt-out at any time in Settings.

### 4. Cloud Save Data (If Implemented)

**Current Status**: Cloud save functionality may be implemented in future versions.

**If cloud save is implemented**, and you choose to use it:
- Your game save data will be encrypted and stored on a secure server
- A random device ID will be used to sync your progress
- You can delete your cloud save data at any time
- No personal information is required to use cloud saves

## Data We DO NOT Collect

We explicitly DO NOT collect:
- Name, email, or contact information
- Payment information (game is free)
- Social media accounts
- Photos or camera access
- Microphone or audio recordings
- Location data
- Contacts or address book
- Browser history
- Data from other apps

## How We Use Data

Your locally stored game data is used solely to:
1. Save your game progress
2. Restore your game when you return
3. Sync progress across devices (if you enable cloud save)

We do NOT:
- Sell your data
- Share your data with third parties
- Use your data for advertising
- Track you across websites
- Create user profiles
- Use your data for any purpose other than game functionality

## Third-Party Services

### Tone.js (Audio Library)

Tone.js is vendored in this repository at `vendor/tone-15.1.22.js` and served from the same origin as the game. No third-party CDN request is made for audio.

- **Provider**: Same-origin static asset
- **Purpose**: Audio synthesis
- **Third-party data transfer**: None for the default static build

**Note**: If a future hosted build reintroduces a remote audio dependency, this policy must be updated before release.

### Hosting Provider

If this game is hosted on a web server, the hosting provider may collect:
- Standard web server logs (IP address, browser type, access times)
- This data is used only for server maintenance and security

We do not have access to or use this server log data for tracking purposes.

## Cookies

**Current Status**: Hex Compiler does NOT use cookies.

We use LocalStorage instead of cookies for game save data. LocalStorage:
- Is stored only on your device
- Is not transmitted to servers
- Does not track you across websites
- Can be cleared through browser settings

## Children's Privacy (COPPA Compliance)

Hex Compiler does not knowingly collect personal information from children under 13.

- No personal information is required to play
- No account creation is needed
- All data is stored locally on the device
- If we discover we have collected data from a child under 13, we will delete it

**For Parents**: You can delete all game data through your child's browser settings at any time.

## Your Rights (GDPR & CCPA Compliance)

Even though we collect minimal data, you have the right to:

### Right to Access
You can view all data we store by:
1. Opening your browser's Developer Tools (F12)
2. Going to Application → LocalStorage
3. Finding entries starting with "cyberWitches"

### Right to Deletion
You can delete all your data by:
1. Using the in-game "Reset All Progress" button, OR
2. Clearing your browser's LocalStorage, OR
3. Clearing all site data in browser settings

### Right to Data Portability
You can export your game save data:
1. Open Settings → Export Save
2. Download your save file as JSON
3. Import it on another device or browser

### Right to Opt-Out
- Game functionality: You can stop playing at any time
- Analytics (if enabled): Opt-out in Settings → Privacy
- Cloud save (if implemented): Don't enable the feature

## Data Security

We protect your data through:

1. **Local Storage**: Data stays on your device by default
2. **No Transmission**: No data is sent to servers (unless you use cloud save)
3. **Encryption** (if cloud save is used): All transmitted data is encrypted with HTTPS
4. **No Personal Data**: We don't collect data that could identify you
5. **Open Source**: Code is publicly reviewable for transparency

However, please note:
- We cannot protect against malware on your device
- We cannot protect against unauthorized access to your device
- Browser vulnerabilities are outside our control

## Data Retention

- **Local Data**: Stored indefinitely until you delete it
- **Cloud Save Data** (if implemented): Stored until you delete it or after 2 years of inactivity
- **Analytics Data** (if enabled): Anonymized and retained for 90 days

## International Data Transfers

- **Local Data**: Never leaves your device
- **Cloud Save** (if implemented): May be stored on servers in different countries
- **Audio library**: Served with the app from the same host

All data transmission uses encryption (HTTPS) and complies with GDPR standards.

## Changes to This Policy

We may update this Privacy Policy to:
- Reflect new features (like cloud save or analytics)
- Comply with new regulations
- Improve clarity

**How we notify you**:
1. Update the "Last Updated" date at the top
2. Show a notification in-game (for major changes)
3. Post changes in the game's repository

**Your continued use** of the game after changes constitutes acceptance.

## Do Not Track (DNT)

We respect Do Not Track browser settings. Since we don't track users by default, enabling DNT has no additional effect, but we honor the principle.

## Your Consent

By playing Hex Compiler, you consent to this Privacy Policy.

If we add features that collect additional data (like analytics), we will:
1. Ask for your explicit consent
2. Provide an opt-out option
3. Update this policy

## Contact & Questions

For privacy questions or concerns:
1. Open an issue on the game's GitHub repository
2. Review the source code (game is open-source)
3. Contact via the repository's contact information

## Your Rights Summary

✅ **You have the right to**:
- Know what data we collect (listed above)
- Access your data (via browser DevTools)
- Delete your data (via in-game reset or browser)
- Export your data (via save export)
- Opt-out of optional features
- Request clarification on data practices

## Transparency Commitment

As an open-source game:
- All code is publicly reviewable
- No hidden data collection
- No deceptive practices
- Community can audit our privacy practices

---

## Quick Privacy Summary

**What we collect**: Game save data (locally on your device)
**What we don't collect**: Any personal information
**Who we share with**: No one (data stays on your device)
**How to delete**: Browser settings or in-game reset
**Cookies**: None
**Age restriction**: Safe for all ages, COPPA compliant

---

**This policy complies with**:
- ✅ GDPR (General Data Protection Regulation - EU)
- ✅ CCPA (California Consumer Privacy Act - USA)
- ✅ COPPA (Children's Online Privacy Protection Act - USA)
- ✅ Privacy Shield Principles

**Last Reviewed**: 2025-11-08
**Next Review**: 2026-02-08

---

*This is a living document and may be updated as the game evolves.*
