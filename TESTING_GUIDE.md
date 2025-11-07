# CyberWitches Testing Guide

This comprehensive testing guide covers all new features implemented in CyberWitches. Use this guide to systematically test each feature and verify proper functionality.

## Table of Contents

1. [Quick Start Testing](#quick-start-testing)
2. [Feature Testing](#feature-testing)
   - [Digital Candle Forge](#digital-candle-forge)
   - [Coven System](#coven-system)
   - [Mobile Features](#mobile-features)
   - [Accessibility Features](#accessibility-features)
   - [Performance Monitoring](#performance-monitoring)
   - [Cloud Save System](#cloud-save-system)
   - [Analytics System](#analytics-system)
3. [Testing Checklists](#testing-checklists)
4. [Debug Commands and Tools](#debug-commands-and-tools)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start Testing

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local development server running (`python3 -m http.server 3000`)
- For mobile testing: Chrome DevTools device mode or actual mobile device

### Initial Setup
1. Navigate to `http://localhost:3000/index.html` (main game file)
2. Open browser DevTools (F12) for console access
3. For mobile testing, use DevTools device mode or test on actual device

### Basic Game Flow Test
1. Verify game loads without errors
2. Check that AB (Arcane Bits) counter displays and updates
3. Test Cast button functionality
4. Verify tab navigation works
5. Check that workstations can be crafted

---

## Feature Testing

### Digital Candle Forge

#### Location
- **Tab**: Workstations tab
- **Access**: Craft workstations using ingredients gathered from casting

#### How to Test
1. **Basic Crafting**:
   - Cast spells to gather ingredients
   - Navigate to Workstations tab
   - Try crafting a basic workstation (e.g., Digital Candle)
   - Verify ingredients are deducted correctly
   - Confirm workstation appears in inventory

2. **Batch Crafting**:
   - Test "Craft x10" button
   - Test "Max" button for maximum affordable quantity
   - Verify cost scaling works correctly

3. **Production Verification**:
   - After crafting, verify AB/s production increases
   - Check that new workstations contribute to production
   - Test multiple workstations of the same type

#### Expected Behaviors
- Ingredients are properly deducted from inventory
- Workstation count increases correctly
- Production rate updates immediately
- Cost scaling follows exponential growth
- Visual feedback appears on successful craft
- Error handling for insufficient ingredients

#### Common Issues
- Ingredients not appearing: Check if casting is working
- Production not updating: Verify game tick is running
- Cost calculation errors: Check recipe scaling formula

---

### Coven System

#### Location
- **Tab**: Coven tab (🔮)
- **Access**: Click the Coven tab in the navigation

#### How to Test
1. **Create a Coven**:
   - Enter Coven tab
   - Fill in coven name and description
   - Click "Create Coven" button
   - Verify coven creation success message
   - Check that you appear as leader

2. **Join a Coven**:
   - Leave current coven if in one
   - Click "Join Mock Coven" for testing
   - Verify successful join message
   - Check member list updates

3. **Coven Bonuses**:
   - Check production bonus percentage
   - Verify bonus applies to AB generation
   - Test with multiple members (simulated)

4. **Coven Rituals**:
   - View active rituals in Coven tab
   - Contribute to ritual progress by casting/crafting
   - Verify ritual progress updates
   - Test ritual completion rewards

#### Expected Behaviors
- Coven creation/joining works smoothly
- Production bonuses apply correctly
- Ritual progress updates in real-time
- Member list displays correctly
- Leader permissions work properly

#### Common Issues
- Coven not saving: Check localStorage functionality
- Bonuses not applying: Verify bonus calculation
- Ritual progress stuck: Check progress update triggers

---

### Mobile Features

#### Location
- **Access**: Touch gestures on mobile devices or DevTools device mode
- **UI Elements**: Enhanced touch targets throughout the interface

#### How to Test
1. **Touch Gestures**:
   - **Swipe Navigation**: Swipe left/right between tabs
   - **Pull-to-Refresh**: Pull down at top of page to refresh
   - **Long Press**: Hold on interactive elements for context menu
   - **Double Tap**: Double-tap for zoom toggle

2. **Touch Targets**:
   - Verify all buttons meet minimum 44px touch target size
   - Test button spacing to prevent accidental taps
   - Check touch feedback animations

3. **Mobile Optimizations**:
   - Test on actual mobile device if possible
   - Verify responsive layout adapts to screen size
   - Check performance on lower-end devices

#### Expected Behaviors
- Swipe gestures smoothly navigate between tabs
- Pull-to-refresh triggers resource generation
- Long press shows context menu with options
- Touch feedback provides visual confirmation
- Layout adapts properly to different screen sizes

#### Common Issues
- Swipe not working: Check touch event handlers
- Zoom not resetting: Verify double-tap handler
- Layout breaking: Test responsive breakpoints

---

### Accessibility Features

#### Location
- **Access**: Keyboard navigation, screen reader support
- **Settings**: High contrast mode, text scaling, color blind themes

#### How to Test
1. **Keyboard Navigation**:
   - Use Tab key to navigate through interface
   - Use Arrow keys to navigate within tabs and cards
   - Use Enter/Space to activate buttons
   - Use Escape to close modals

2. **Screen Reader Support**:
   - Enable screen reader (NVDA, JAWS, or VoiceOver)
   - Verify ARIA labels are read correctly
   - Check that dynamic content updates are announced
   - Test skip link functionality

3. **Visual Accessibility**:
   - **High Contrast**: Press Ctrl+Alt+H to toggle
   - **Text Scaling**: Use Ctrl/Cmd + Plus/Minus to scale
   - **Color Blind Themes**: Press Ctrl+Alt+1-4 for different themes

#### Expected Behaviors
- All interactive elements are keyboard accessible
- Screen reader announces important game events
- High contrast mode provides sufficient contrast
- Text scaling maintains readability
- Color blind themes use distinguishable colors

#### Common Issues
- Focus not visible: Check focus indicators
- Announcements not working: Verify ARIA live regions
- Color contrast insufficient: Use contrast checker tools

---

### Performance Monitoring

#### Location
- **Access**: Debug console (when enabled)
- **Visual Overlay**: Performance monitor overlay
- **Debug Mode**: Enable via console commands

#### How to Test
1. **Performance Overlay**:
   - Open browser console
   - Type: `performanceMonitor.initialize(true)`
   - Verify overlay appears in top-right corner
   - Monitor FPS, memory usage, and suggestions

2. **Debug Console**:
   - With debug mode enabled, use debug console
   - Type `help` for available commands
   - Test commands like `fps`, `memory`, `metrics`

3. **Performance Features**:
   - Test virtual scrolling with large lists
   - Verify particle effects don't impact performance
   - Check that low-performance mode activates automatically

#### Expected Behaviors
- FPS counter displays current frame rate
- Memory usage is tracked and reported
- Performance suggestions appear when needed
- Debug commands execute properly
- Low-performance mode reduces effects automatically

#### Common Issues
- Overlay not appearing: Check initialization
- FPS counter stuck: Verify requestAnimationFrame
- Memory tracking not working: Check performance.memory support

---

### Cloud Save System

#### Location
- **Access**: Automatic sync, manual export/import
- **Settings**: Cloud save status and controls

#### How to Test
1. **Automatic Sync**:
   - Make changes to game state
   - Wait 5 minutes for automatic sync
   - Check browser console for sync messages
   - Verify localStorage contains save data

2. **Manual Export**:
   - Open browser console
   - Type: `cloudSaveSystem.exportSave()`
   - Verify save file downloads
   - Check file contains valid JSON data

3. **Manual Import**:
   - Create a test save file
   - Use file input to import (if implemented)
   - Or use console: `cloudSaveSystem.importSave(file)`
   - Verify game state updates correctly

4. **Conflict Resolution**:
   - Create save on two different browsers/tabs
   - Make conflicting changes
   - Verify merge logic works correctly
   - Check that newer data takes precedence

#### Expected Behaviors
- Automatic sync occurs every 5 minutes
- Manual export creates valid JSON file
- Import correctly restores game state
- Conflict resolution preserves progress
- Offline mode gracefully handles sync failures

#### Common Issues
- Sync not working: Check online status and API endpoints
- Import failing: Verify file format and validation
- Data corruption: Check save data structure

---

### Analytics System

#### Location
- **Access**: Browser console, network tab
- **Settings**: Privacy controls and opt-in/out

#### How to Test
1. **Opt-in/Opt-out**:
   - Check initial opt-in status
   - Test opt-out: `analytics.setOptInStatus(false)`
   - Test opt-in: `analytics.setOptInStatus(true)`
   - Verify events are only tracked when opted in

2. **Event Tracking**:
   - Perform various game actions
   - Check console for event logs
   - Verify events are stored locally
   - Test batch sending (every 5 minutes)

3. **Privacy Features**:
   - Test data anonymization
   - Check that sensitive data is excluded
   - Verify user ID is hashed when anonymized
   - Test privacy settings updates

4. **Performance Tracking**:
   - Monitor FPS tracking
   - Check memory usage tracking
   - Verify error tracking works
   - Test page load performance metrics

#### Expected Behaviors
- Analytics only track when user opts in
- Events are properly categorized and formatted
- Sensitive data is anonymized or excluded
- Performance metrics are collected accurately
- Privacy settings are respected

#### Common Issues
- Events not tracking: Check opt-in status
- Data not anonymized: Verify privacy settings
- Performance metrics missing: Check browser support

---

## Testing Checklists

### Digital Candle Forge Checklist

- [ ] Basic casting generates ingredients
- [ ] Workstation tab displays available workstations
- [ ] Crafting x1 works correctly
- [ ] Crafting x10 works correctly
- [ ] Max button calculates correct amount
- [ ] Ingredients are deducted properly
- [ ] Production rate updates after crafting
- [ ] Cost scaling follows exponential growth
- [ ] Visual feedback appears on success
- [ ] Error handling for insufficient ingredients
- [ ] Multiple workstations stack production

### Coven System Checklist

- [ ] Coven creation works
- [ ] Coven joining works
- [ ] Member list displays correctly
- [ ] Leader permissions work
- [ ] Production bonus applies
- [ ] Ritual progress updates
- [ ] Ritual completion rewards
- [ ] Coven level progression
- [ ] Leave coven functionality
- [ ] Mock coven for testing

### Mobile Features Checklist

- [ ] Swipe left/right navigation
- [ ] Pull-to-refresh functionality
- [ ] Long press context menu
- [ ] Double tap zoom
- [ ] Touch target sizes (44px minimum)
- [ ] Touch feedback animations
- [ ] Responsive layout adaptation
- [ ] Performance on mobile devices
- [ ] Haptic feedback (if supported)
- [ ] Gesture hints display

### Accessibility Features Checklist

- [ ] Full keyboard navigation
- [ ] Screen reader announcements
- [ ] ARIA labels on all interactive elements
- [ ] High contrast mode toggle
- [ ] Text scaling (80%-200%)
- [ ] Color blind themes
- [ ] Focus indicators
- [ ] Skip link functionality
- [ ] Reduced motion support
- [ ] Error announcements

### Performance Monitoring Checklist

- [ ] FPS counter displays
- [ ] Memory usage tracking
- [ ] Performance overlay
- [ ] Debug console commands
- [ ] Performance suggestions
- [ ] Low-performance mode
- [ ] Virtual scrolling
- [ ] Particle effect optimization
- [ ] Long task detection
- [ ] Layout shift tracking

### Cloud Save System Checklist

- [ ] Automatic sync (5-minute intervals)
- [ ] Manual export functionality
- [ ] Manual import functionality
- [ ] Conflict resolution
- [ ] Offline mode handling
- [ ] Save data validation
- [ ] Local storage fallback
- [ ] Sync status indicators
- [ ] Error handling
- [ ] Save data integrity

### Analytics System Checklist

- [ ] Opt-in/opt-out functionality
- [ ] Event tracking for all actions
- [ ] Data anonymization
- [ ] Privacy controls
- [ ] Performance metrics collection
- [ ] Error tracking
- [ ] Batch event sending
- [ ] Session tracking
- [ ] User ID management
- [ ] Data export functionality

---

## Debug Commands and Tools

### Console Commands

#### Performance Monitor
```javascript
// Initialize with debug mode
performanceMonitor.initialize(true);

// Toggle performance overlay
performanceMonitor.togglePerformanceOverlay(true/false);

// Get current metrics
performanceMonitor.getMetrics();
```

#### Cloud Save System
```javascript
// Force immediate sync
cloudSaveSystem.forceSync();

// Export save data
cloudSaveSystem.exportSave();

// Get sync status
cloudSaveSystem.getSyncStatus();

// Get save statistics
cloudSaveSystem.getSaveStats();
```

#### Analytics System
```javascript
// Set opt-in status
analytics.setOptInStatus(true/false);

// Get analytics summary
analytics.getAnalyticsSummary();

// Export analytics data
analytics.exportAnalyticsData();

// Update privacy settings
analytics.updatePrivacySettings({
    collectPerformance: false,
    anonymizeData: true
});
```

#### Particle Effects
```javascript
// Create specific effects
particleEffects.createSpellCastEffect(x, y);
particleEffects.createAchievementEffect(x, y);
particleEffects.createLevelUpEffect(x, y);

// Get system stats
particleEffects.getStats();

// Set performance mode
particleEffects.setPerformanceMode(true/false);
```

#### Accessibility
```javascript
// Toggle high contrast
window.Accessibility.highContrastManager.toggleHighContrast();

// Scale text
window.Accessibility.textScalingManager.increaseTextScale();
window.Accessibility.textScalingManager.decreaseTextScale();

// Set color blind theme
window.Accessibility.colorBlindThemeManager.setTheme('protanopia');
```

### Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| 1-8 | Switch to tabs 1-8 |
| Space | Cast spell |
| S | Save game |
| A | Show ascend modal |
| Escape | Close modals |
| Ctrl+Alt+H | Toggle high contrast |
| Ctrl/Cmd + Plus/Minus | Scale text |
| Ctrl/Cmd + 0 | Reset text size |
| Ctrl+Alt+1-4 | Color blind themes |

### Debug Mode

To enable debug mode:
1. Open browser console
2. Type: `performanceMonitor.initialize(true)`
3. Performance overlay and debug console will appear

Debug console commands:
- `help` - Show available commands
- `fps` - Show FPS information
- `memory` - Show memory information
- `metrics` - Show all performance metrics
- `add_ab [amount]` - Add AB for testing
- `set_level [level]` - Set player level
- `clear_save` - Clear save data
- `export_save` - Export save data
- `particles` - Toggle particle effects
- `performance` - Toggle performance overlay

---

## Troubleshooting

### Common Issues and Solutions

#### Game Not Loading
- **Check**: Browser console for errors
- **Solution**: Ensure all JavaScript files are loading correctly
- **Verify**: Local server is running on correct port

#### Features Not Working
- **Check**: Ensure you're using `index.html` (the main game file)
- **Solution**: Use `index.html` for all features
- **Verify**: All required JavaScript files are included

#### Performance Issues
- **Check**: Performance overlay for metrics
- **Solution**: Enable low-performance mode
- **Verify**: Particle effects aren't causing lag

#### Mobile Issues
- **Check**: Touch event listeners are working
- **Solution**: Test on actual device, not just emulator
- **Verify**: Viewport meta tag is present

#### Save/Load Issues
- **Check**: Browser localStorage quota
- **Solution**: Clear old save data if corrupted
- **Verify**: JSON structure is valid

#### Accessibility Issues
- **Check**: ARIA attributes are present
- **Solution**: Test with actual screen reader
- **Verify**: Color contrast meets WCAG standards

### Testing Best Practices

1. **Test in multiple browsers** - Chrome, Firefox, Safari, Edge
2. **Test on actual devices** - Not just emulators
3. **Use browser DevTools** - Network, Console, Performance tabs
4. **Test edge cases** - Empty states, error conditions
5. **Verify responsive design** - Different screen sizes
6. **Check performance** - Monitor FPS and memory usage
7. **Test accessibility** - Keyboard navigation, screen reader
8. **Validate data** - Check save files, API responses
9. **Test offline behavior** - Disable network connection
10. **Document issues** - Screenshots, console errors, steps to reproduce

### Reporting Issues

When reporting issues, include:
1. Browser and version
2. Device and OS
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors (if any)
6. Screenshots (if applicable)
7. Performance metrics (if relevant)

---

## Conclusion

This testing guide provides comprehensive coverage of all CyberWitches features. Use it systematically to ensure each feature works as expected. For any issues not covered here, please refer to the source code or contact the development team.

Remember to test both the happy path and edge cases, and always verify that accessibility and performance requirements are met.