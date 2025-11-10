# Pre-Launch Checklist
## Hex Compiler - What Still Needs to Be Done

**Last Updated**: 2025-11-08
**Current Version**: 1.0.0
**Launch Target**: TBD

This document outlines all remaining tasks before Hex Compiler can launch publicly. Items are categorized by priority and estimated effort.

---

## 🔴 CRITICAL - Must Have Before Launch

### 1. Legal & Compliance 🚨

#### ❌ Privacy Policy (REQUIRED)
**Status**: Missing
**Effort**: 2-4 hours
**Legal Risk**: HIGH

**Required Sections**:
- [ ] What data is collected (localStorage items, analytics if any)
- [ ] How data is used
- [ ] Data retention policy
- [ ] User rights (access, deletion, portability)
- [ ] Cookie policy (if applicable)
- [ ] Third-party services (Tone.js CDN, hosting provider)
- [ ] Contact information
- [ ] GDPR compliance statement
- [ ] CCPA compliance (if US users)
- [ ] Children's privacy (COPPA compliance)

**Action Items**:
- [ ] Create `PRIVACY.md` or `privacy.html`
- [ ] Add link in footer: "Privacy Policy"
- [ ] Add link in settings menu
- [ ] Review with legal counsel (recommended)
- [ ] Date and version the policy

**Template Resources**:
- [Termly Privacy Policy Generator](https://termly.io/products/privacy-policy-generator/)
- [PrivacyPolicies.com](https://www.privacypolicies.com/)

---

#### ❌ Terms of Service / EULA
**Status**: Missing
**Effort**: 2-4 hours
**Legal Risk**: HIGH

**Required Sections**:
- [ ] Acceptable use policy
- [ ] Account termination conditions
- [ ] Intellectual property rights
- [ ] Limitation of liability
- [ ] Warranty disclaimer
- [ ] Dispute resolution
- [ ] Governing law
- [ ] Changes to terms notification

**Action Items**:
- [ ] Create `TERMS.md` or `terms.html`
- [ ] Add link in footer: "Terms of Service"
- [ ] Add acceptance checkbox on first launch (optional but recommended)
- [ ] Review with legal counsel (recommended)

---

#### ⚠️ Open Source License Clarification
**Status**: MIT in package.json, but not in repo root
**Effort**: 15 minutes
**Legal Risk**: MEDIUM

**Issues**:
- package.json says "MIT" but no LICENSE file in repo
- Some code may be derived from tutorials/examples (need attribution)
- Tone.js uses MIT license (need to credit)

**Action Items**:
- [ ] Create `LICENSE` file with MIT license text
- [ ] Add copyright year and author name
- [ ] Create `ATTRIBUTION.md` for third-party code/assets
- [ ] List all dependencies and their licenses
- [ ] Credit any tutorial code or inspiration sources
- [ ] Add license header to main source files

**MIT License Template**:
```
MIT License

Copyright (c) 2025 [Your Name/Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

---

#### ❌ Content Rating / Age Rating
**Status**: Not declared
**Effort**: 30 minutes
**Legal Risk**: MEDIUM

**Action Items**:
- [ ] Determine ESRB/PEGI equivalent rating
- [ ] Declare age rating in app metadata
- [ ] Add content descriptors if needed
- [ ] Ensure game is appropriate for stated age
- [ ] Add age gate if targeting 13+ (COPPA compliance)

**Recommended Rating**: E for Everyone (no violence, no adult themes)

---

### 2. Security & Data Protection 🔒

#### ⚠️ Content Security Policy (CSP)
**Status**: Not implemented
**Effort**: 2 hours
**Security Risk**: HIGH

**Action Items**:
- [ ] Add CSP meta tag to index.html
- [ ] Restrict script sources
- [ ] Restrict style sources
- [ ] Disable inline scripts/styles (or use nonces)
- [ ] Test that game still works with CSP

**Example CSP**:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' https://cdnjs.cloudflare.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;">
```

---

#### ⚠️ Input Validation & Sanitization
**Status**: Needs review
**Effort**: 4-6 hours
**Security Risk**: MEDIUM

**Areas to Check**:
- [ ] LocalStorage data validation on load
- [ ] Cloud save data validation
- [ ] User input sanitization (if any text inputs exist)
- [ ] Save file import validation
- [ ] Export data sanitization
- [ ] Protection against save file injection

**Action Items**:
- [ ] Add schema validation for save data
- [ ] Implement save data checksum/signature
- [ ] Add bounds checking on all numeric inputs
- [ ] Sanitize any user-generated content
- [ ] Test with malformed save files

---

#### ❌ Rate Limiting (If Backend Added)
**Status**: N/A (no backend yet)
**Effort**: 4 hours (when backend is added)
**Security Risk**: HIGH (if backend added)

**Required If Adding**:
- [ ] Cloud save upload rate limiting
- [ ] Leaderboard submission rate limiting
- [ ] API request rate limiting
- [ ] DDoS protection
- [ ] Authentication if needed

---

### 3. Performance & Optimization ⚡

#### ⚠️ Memory Leak Audit
**Status**: Partial - memoryLeakFix.js exists but needs verification
**Effort**: 4-6 hours
**Performance Risk**: MEDIUM

**Action Items**:
- [ ] Test game running for 24+ hours continuously
- [ ] Monitor memory usage over time
- [ ] Check for event listener leaks
- [ ] Verify interval/timeout cleanup
- [ ] Test save/load doesn't leak memory
- [ ] Profile with Chrome DevTools heap snapshots
- [ ] Fix any identified leaks

**Testing Procedure**:
```javascript
// Run in console after 6+ hours of play
performance.memory.usedJSHeapSize / 1024 / 1024 + " MB"
```

---

#### ✅ Bundle Size Optimization
**Status**: Good - using esbuild minification
**Effort**: Monitoring only
**Performance Risk**: LOW

**Current State**:
- Using esbuild for production builds
- Minification enabled
- No code splitting yet

**Nice to Have**:
- [ ] Code splitting by route/tab
- [ ] Lazy load meditation UI
- [ ] Lazy load audio system
- [ ] Dynamic imports for large features

---

#### ⚠️ Image Optimization Verification
**Status**: Needs audit
**Effort**: 2-3 hours
**Performance Risk**: MEDIUM

**Action Items**:
- [ ] Audit all images for optimization
- [ ] Convert PNGs to WebP where possible
- [ ] Add fallback images for unsupported browsers
- [ ] Implement lazy loading for off-screen images
- [ ] Add `loading="lazy"` to img tags
- [ ] Consider using `<picture>` for responsive images
- [ ] Compress background images further

**Current Image Formats**:
```bash
# Check current image sizes
find images/ -type f -exec ls -lh {} \; | awk '{print $5, $9}'
```

---

### 4. Browser Compatibility 🌐

#### ⚠️ Cross-Browser Testing
**Status**: Likely works but not verified
**Effort**: 8-12 hours
**Compatibility Risk**: HIGH

**Browsers to Test** (minimum):
- [ ] Chrome 120+ (primary target)
- [ ] Firefox 120+
- [ ] Safari 17+ (macOS & iOS)
- [ ] Edge 120+
- [ ] Samsung Internet (Android)
- [ ] Chrome iOS

**Features to Test**:
- [ ] LocalStorage works
- [ ] Service Worker installs
- [ ] Audio playback
- [ ] PWA installation
- [ ] Offline mode
- [ ] Touch events (mobile)
- [ ] Keyboard navigation
- [ ] Responsive layout

**Known Issues to Check**:
- Safari: Service Worker quirks
- iOS: Audio autoplay restrictions
- Firefox: CSS compatibility
- Mobile browsers: Viewport units

---

#### ❌ Polyfills for Older Browsers
**Status**: Not implemented
**Effort**: 2-3 hours
**Compatibility Risk**: MEDIUM

**Action Items**:
- [ ] Add core-js for ES2015+ features
- [ ] Add fetch polyfill (if needed)
- [ ] Add IntersectionObserver polyfill
- [ ] Add Web Audio polyfill (if targeting Safari <14)
- [ ] Test on older browsers (Chrome 90, Firefox 90)

**Recommended Support**:
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: Last 2 versions

---

### 5. Accessibility ♿

#### ⚠️ WCAG 2.1 AA Compliance Audit
**Status**: Basic compliance, needs full audit
**Effort**: 8-12 hours
**Accessibility Risk**: MEDIUM

**Required Tests**:
- [ ] Run Axe DevTools audit
- [ ] Run Lighthouse accessibility audit
- [ ] Manual keyboard navigation test
- [ ] Screen reader test (NVDA/JAWS/VoiceOver)
- [ ] Color contrast test (all text meets 4.5:1)
- [ ] Focus indicator visibility
- [ ] Skip navigation links
- [ ] Form label associations

**Current Accessibility Features**:
- ✅ accessibility.js exists
- ✅ Reduced motion support
- ⚠️ ARIA labels (need verification)
- ⚠️ Keyboard navigation (needs testing)

**Action Items**:
- [ ] Fix any Axe violations
- [ ] Ensure all buttons have accessible names
- [ ] Add ARIA live regions for dynamic content
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Document keyboard shortcuts

---

### 6. Content Completeness 📝

#### ❌ In-Game Help/Tutorial
**Status**: Onboarding exists, but no help reference
**Effort**: 4-6 hours
**User Experience Risk**: HIGH

**Action Items**:
- [ ] Add "?" help button in UI
- [ ] Create help modal/sidebar
- [ ] Explain all game mechanics
- [ ] Add tooltips to complex features
- [ ] Create video tutorial (optional)
- [ ] Add FAQ section

**Help Topics Needed**:
- What is AB (Arcane Bits)?
- How workstations work
- What inscriptions do
- How prestige works
- Element specialization explained
- Meditation system guide
- Daily rituals explained
- Achievement system
- Experiment system
- How to optimize progression

---

#### ⚠️ Credits Page
**Status**: Incomplete
**Effort**: 1-2 hours
**User Experience Risk**: LOW

**Action Items**:
- [ ] Add Credits section to settings/about
- [ ] Credit Tone.js library
- [ ] Credit any image sources
- [ ] Credit any tutorial/inspiration sources
- [ ] Credit testers (if any)
- [ ] Add developer info
- [ ] Add version number

---

#### ❌ Changelog/Release Notes
**Status**: CHANGELOG.md exists but needs public visibility
**Effort**: 1 hour
**User Experience Risk**: LOW

**Action Items**:
- [ ] Add "What's New" button in UI
- [ ] Show changelog on major updates
- [ ] Maintain CHANGELOG.md
- [ ] Show version number in UI
- [ ] Add release date

---

### 7. Error Handling & Recovery 🛡️

#### ⚠️ Corrupted Save Recovery
**Status**: errorRecovery.js exists but needs testing
**Effort**: 4-6 hours
**User Experience Risk**: HIGH

**Action Items**:
- [ ] Test with corrupted localStorage
- [ ] Test with partially valid saves
- [ ] Test with very old save versions
- [ ] Implement save backups (keep last 3 saves)
- [ ] Add "Restore Backup" feature
- [ ] Add "Export Save" feature
- [ ] Add "Import Save" feature
- [ ] Show helpful error messages

**Test Scenarios**:
- Corrupt JSON in localStorage
- Missing required fields
- Invalid data types
- Save from future version
- Save from very old version
- Malformed prestige data
- Invalid inventory items

---

#### ❌ Network Error Handling (If Backend Added)
**Status**: N/A (no backend yet)
**Effort**: 3-4 hours (when backend is added)
**User Experience Risk**: HIGH (if backend added)

**Required If Adding**:
- [ ] Handle offline mode gracefully
- [ ] Queue failed requests
- [ ] Retry with exponential backoff
- [ ] Show connection status
- [ ] Cache data locally
- [ ] Sync when back online

---

## 🟠 HIGH PRIORITY - Should Have Before Launch

### 8. Analytics & Monitoring 📊

#### ❌ Error Tracking
**Status**: errorReporting.js exists but not configured
**Effort**: 2-3 hours
**Monitoring Risk**: MEDIUM

**Action Items**:
- [ ] Set up Sentry or similar
- [ ] Configure error reporting
- [ ] Add source maps for debugging
- [ ] Set up error alerts
- [ ] Add user context (but preserve privacy)
- [ ] Test error reporting works

**Privacy Considerations**:
- Don't log personal data
- Anonymize user IDs
- Get consent before tracking
- Allow opt-out

---

#### ⚠️ Usage Analytics
**Status**: playerAnalytics.js exists but needs privacy review
**Effort**: 3-4 hours
**Privacy Risk**: MEDIUM

**Action Items**:
- [ ] Review what data is collected
- [ ] Ensure GDPR compliance
- [ ] Add analytics consent prompt
- [ ] Add opt-out option in settings
- [ ] Anonymize data
- [ ] Document in privacy policy
- [ ] Choose analytics provider (or self-host)

**Recommended Tracking** (privacy-friendly):
- Page views
- Button clicks
- Feature usage
- Session duration
- Error rates
- NO personal data
- NO IP addresses
- NO fingerprinting

---

### 9. Performance Monitoring 📈

#### ⚠️ Core Web Vitals Tracking
**Status**: coreWebVitals.js exists but needs verification
**Effort**: 2-3 hours
**SEO Risk**: MEDIUM

**Action Items**:
- [ ] Verify LCP < 2.5s
- [ ] Verify FID < 100ms
- [ ] Verify CLS < 0.1
- [ ] Set up monitoring (Google Search Console)
- [ ] Add to CI/CD (Lighthouse CI)
- [ ] Fix any issues found

---

### 10. SEO & Discoverability 🔍

#### ⚠️ Meta Tags
**Status**: Needs audit
**Effort**: 1-2 hours
**SEO Risk**: MEDIUM

**Required Meta Tags**:
- [ ] `<title>` - descriptive and unique
- [ ] `<meta name="description">` - compelling description
- [ ] `<meta name="keywords">` - relevant keywords
- [ ] Open Graph tags (Facebook sharing)
- [ ] Twitter Card tags
- [ ] `<link rel="canonical">`
- [ ] Structured data (JSON-LD)

**Example**:
```html
<title>Hex Compiler - Idle Magic Crafting Game</title>
<meta name="description" content="Magic is fading. You are a Hex Compiler—one of the last who can preserve it. Cast spells, build workstations, and master the elements in this idle game.">
<meta property="og:title" content="Hex Compiler">
<meta property="og:description" content="Idle magic crafting game">
<meta property="og:image" content="https://yoursite.com/og-image.jpg">
```

---

#### ❌ Sitemap & robots.txt
**Status**: Missing
**Effort**: 30 minutes
**SEO Risk**: LOW (single page app)

**Action Items**:
- [ ] Create sitemap.xml (if multi-page)
- [ ] Create robots.txt
- [ ] Submit sitemap to Google Search Console
- [ ] Verify indexing

---

#### ❌ Social Media Preview Image
**Status**: Missing
**Effort**: 1 hour
**Marketing Risk**: MEDIUM

**Action Items**:
- [ ] Create Open Graph image (1200x630px)
- [ ] Create Twitter Card image (1200x675px)
- [ ] Test with Facebook Sharing Debugger
- [ ] Test with Twitter Card Validator
- [ ] Add images to index.html

---

### 11. Deployment & Infrastructure 🚀

#### ⚠️ HTTPS Enforcement
**Status**: Depends on hosting
**Effort**: Varies by host
**Security Risk**: CRITICAL

**Action Items**:
- [ ] Ensure hosting provides HTTPS
- [ ] Redirect HTTP to HTTPS
- [ ] Use HSTS header
- [ ] Verify service worker works on HTTPS

**HSTS Header**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

#### ❌ CDN Setup
**Status**: Not configured
**Effort**: 2-4 hours
**Performance Risk**: MEDIUM

**Action Items**:
- [ ] Choose CDN provider (Cloudflare recommended - free tier)
- [ ] Configure CDN
- [ ] Set cache headers
- [ ] Test global latency
- [ ] Set up cache invalidation

**Benefits**:
- Faster load times globally
- DDoS protection
- Automatic compression
- SSL/TLS handling

---

#### ❌ Backup & Disaster Recovery
**Status**: No backup plan
**Effort**: 2-3 hours
**Business Risk**: HIGH

**Action Items**:
- [ ] Set up automated backups of repo
- [ ] Document deployment process
- [ ] Create rollback procedure
- [ ] Test disaster recovery
- [ ] Keep copies of production builds

---

### 12. User Experience Polish ✨

#### ⚠️ Loading States
**Status**: loadingState.js exists but needs verification
**Effort**: 2-3 hours
**User Experience Risk**: MEDIUM

**Action Items**:
- [ ] Add loading spinner on initial load
- [ ] Show progress bar for large assets
- [ ] Add skeleton screens
- [ ] Handle slow connections gracefully
- [ ] Add "Still loading..." message after 5s

---

#### ❌ Offline Fallback Page
**Status**: Service worker exists but no custom offline page
**Effort**: 1 hour
**User Experience Risk**: LOW

**Action Items**:
- [ ] Create offline.html
- [ ] Add to service worker cache
- [ ] Serve when offline and resource not cached
- [ ] Make it visually appealing
- [ ] Show helpful message

---

#### ⚠️ Mobile UX Review
**Status**: Mobile responsive but needs polish
**Effort**: 4-6 hours
**User Experience Risk**: MEDIUM

**Action Items**:
- [ ] Test on real mobile devices (not just DevTools)
- [ ] Verify touch targets are 44x44px minimum
- [ ] Test landscape orientation
- [ ] Test on small screens (320px width)
- [ ] Optimize for one-handed use
- [ ] Fix any mobile-specific bugs

**Known Issues**:
- mobile.js shows "Settings coming soon" placeholder
- May need mobile-specific navigation

---

## 🟡 MEDIUM PRIORITY - Nice to Have

### 13. Feature Completeness

#### ⚠️ Mobile Settings Menu
**Status**: Placeholder "coming soon"
**Effort**: 3-4 hours
**User Experience Risk**: MEDIUM

**Current Issue**:
```javascript
// In mobile.js
window.showNotification('Settings coming soon!', 'info');
```

**Action Items**:
- [ ] Implement mobile settings modal
- [ ] Add volume controls
- [ ] Add quality settings
- [ ] Add privacy settings
- [ ] Add export/import save

---

#### ❌ Particle Effects Re-enablement
**Status**: Disabled for performance
**Effort**: 6-8 hours
**User Experience Risk**: LOW

**Current State**:
- particleEffects.js exists but completely disabled
- Might be too performance-intensive
- Could be optional setting

**Options**:
1. Make it an optional "High Quality" setting
2. Use lightweight CSS animations instead
3. Keep disabled, use static effects
4. Implement WebGL-based particles (better performance)

---

### 14. Internationalization

#### ❌ Language Support
**Status**: Not implemented
**Effort**: HIGH (see FUTURE_DEVELOPMENT.md)
**User Experience Risk**: MEDIUM (for non-English users)

**Action Items**:
- See FUTURE_DEVELOPMENT.md Section 2
- Consider for post-launch

---

### 15. Community Features

#### ❌ Discord Integration
**Status**: Not implemented
**Effort**: 1-2 hours
**Community Risk**: LOW

**Action Items**:
- [ ] Create Discord server
- [ ] Add Discord link to game
- [ ] Add "Join Discord" button
- [ ] Set up community guidelines

---

## 🟢 LOW PRIORITY - Post-Launch

### 16. Monetization

See FUTURE_DEVELOPMENT.md Section 4 for details.

**Not Required for Launch**:
- Donation system
- Premium themes
- Supporter tier

---

### 17. Platform Expansion

See FUTURE_DEVELOPMENT.md Section 6 for details.

**Not Required for Launch**:
- Steam release
- Mobile app stores
- Electron desktop app

---

## ✅ Launch Readiness Checklist

Use this final checklist before going live:

### Legal ✅
- [ ] Privacy Policy published and linked
- [ ] Terms of Service published and linked
- [ ] LICENSE file in repo
- [ ] ATTRIBUTION.md credits all third parties
- [ ] Age rating declared
- [ ] COPPA compliance verified (if applicable)

### Security ✅
- [ ] HTTPS enforced
- [ ] Content Security Policy implemented
- [ ] Input validation on all user data
- [ ] Save file validation
- [ ] No XSS vulnerabilities
- [ ] No injection vulnerabilities

### Performance ✅
- [ ] Lighthouse score >90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] No memory leaks (tested 24h+)
- [ ] Works on slow 3G

### Compatibility ✅
- [ ] Chrome latest (tested)
- [ ] Firefox latest (tested)
- [ ] Safari latest (tested)
- [ ] Edge latest (tested)
- [ ] Mobile Safari (tested)
- [ ] Mobile Chrome (tested)

### Accessibility ✅
- [ ] Axe audit passes
- [ ] Lighthouse accessibility score 100
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible

### Content ✅
- [ ] All features complete (or disabled)
- [ ] Help/tutorial accessible
- [ ] Credits page complete
- [ ] Error messages helpful
- [ ] Loading states smooth
- [ ] Offline mode works

### Monitoring ✅
- [ ] Error tracking configured
- [ ] Analytics configured (with consent)
- [ ] Performance monitoring active
- [ ] Backup system in place

### Marketing ✅
- [ ] Meta tags optimized
- [ ] Social preview images
- [ ] Description compelling
- [ ] Screenshots ready
- [ ] Demo video (optional)

---

## Estimated Total Effort

| Priority | Tasks | Estimated Hours |
|----------|-------|-----------------|
| 🔴 Critical | 30 items | 60-80 hours |
| 🟠 High | 12 items | 25-35 hours |
| 🟡 Medium | 5 items | 15-20 hours |
| 🟢 Low | - | Post-launch |
| **TOTAL** | **47 items** | **100-135 hours** |

**Timeline Estimate**: 3-4 weeks of full-time work, or 6-8 weeks part-time

---

## Priority Recommendations

If time is limited, focus on:

1. **Week 1 - Legal & Security** (30 hours)
   - Privacy Policy & Terms
   - LICENSE file
   - Content Security Policy
   - HTTPS enforcement
   - Input validation

2. **Week 2 - Compatibility & Accessibility** (25 hours)
   - Cross-browser testing
   - Mobile testing
   - Accessibility audit
   - Screen reader testing
   - Error handling

3. **Week 3 - Content & Polish** (25 hours)
   - Help/tutorial
   - Loading states
   - Error messages
   - Meta tags / SEO
   - Credits page

4. **Week 4 - Monitoring & Final Testing** (20 hours)
   - Analytics setup
   - Error tracking
   - Memory leak testing
   - Final QA pass
   - Launch!

---

**Document Maintained By**: Development Team
**Last Updated**: 2025-11-08
**Next Review**: Weekly until launch
