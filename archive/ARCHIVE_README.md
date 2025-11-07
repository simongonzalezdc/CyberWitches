# Archive Directory

This directory contains deprecated, old, or unused files that have been archived from the main codebase. Files are organized into subdirectories for easy reference.

**Archive Date:** January 2025  
**Reason:** Codebase cleanup and documentation audit

---

## Directory Structure

```
archive/
├── code/          # Deprecated/unused JavaScript files
├── docs/          # Outdated documentation files
├── test-files/    # Old test HTML files and variants
├── old-builds/    # Old build artifacts (zip files)
└── ARCHIVE_README.md  # This file
```

---

## Archived Files

### Code Files (`archive/code/`)

#### Coven System Files (Archived for Future Development)
- `covenSystem.js` - Core coven management system
- `covenChat.js` - Chat system implementation
- `covenEvents.js` - Event system implementation
- `covenAchievements.js` - Achievement system
- `socialLeaderboards.js` - Leaderboard system

**Status:** Archived - Requires backend infrastructure for full functionality  
**Documentation:** See `ARCHIVED_COVEN_FEATURES.md` in root directory

#### Unused/Deprecated Code
- `searchFilter.js` - Search and filter functionality (removed from active codebase)
  - **Reason:** Feature was removed per user request
  - **Status:** No longer imported or used

- `game-fixed.js` - Backup/old version of game.js
  - **Reason:** Backup file, no longer needed
  - **Status:** Superseded by current `js/game.js`

#### Old Stylesheets
- `styles-new.css` - Old stylesheet variant
- `styles-old.css` - Old stylesheet variant
  - **Reason:** Replaced by current `styles.css`
  - **Status:** No longer used

---

### Test Files (`archive/test-files/`)

#### Old Index HTML Variants
- `index-debug.html` - Debug version
- `index-fixed.html` - Fixed version
- `index-full.html` - Full feature version
- `index-minimal.html` - Minimal version
- `index-new.html` - New version
- `index-old.html` - Old version
- `index-working.html` - Working version

**Reason:** Multiple variants created during development/testing  
**Status:** All replaced by single `index.html` in root directory

#### Test HTML Files
- `minimal-test.html` - Minimal test file
- `test-game-loading.html` - Game loading test
- `test-loading.html` - Loading test
- `test-modules.html` - Module test
- `reset-game.html` - Game reset utility

**Reason:** Development/testing files no longer needed  
**Status:** Replaced by proper test suite in `tests/` directory

---

### Documentation (`archive/docs/`)

#### Outdated Audit Reports
- `GAME_DESIGN_AUDIT_2024.md` - Game design audit from 2024
  - **Reason:** Superseded by `GAME_DESIGN_AUDIT_2025.md`
  - **Status:** Historical reference only

- `OPTIMIZATION_REPORT.md` - Optimization report from November 2024
  - **Reason:** Outdated, optimizations have been completed
  - **Status:** Historical reference only

- `OPTIMIZATION_COMPLETE.md` - Optimization completion report from November 2024
  - **Reason:** Outdated, optimizations documented in CHANGELOG.md
  - **Status:** Historical reference only

---

### Old Builds (`archive/old-builds/`)

- `CyberWitches-20251106-131903.zip` - Old build artifact from November 6, 2025
  - **Reason:** Old build snapshot, no longer needed
  - **Status:** Historical reference only

---

## Restoration Instructions

If you need to restore any archived files:

1. **Coven System Files:**
   - Move files from `archive/code/` back to `js/`
   - Follow instructions in `ARCHIVED_COVEN_FEATURES.md`
   - Uncomment coven system code in `js/gameState.js` and `js/game.js`

2. **Test Files:**
   - Move files from `archive/test-files/` back to root if needed for testing
   - Note: These are old variants and may not work with current codebase

3. **Documentation:**
   - Reference files in `archive/docs/` for historical context
   - Current documentation is in root directory

---

## Notes

- All archived files are preserved for historical reference
- Files can be safely deleted if disk space is a concern
- Before deleting, ensure no critical information is lost
- Consider creating a git tag before major cleanup operations

---

**Last Updated:** January 2025  
**Maintained By:** Development Team

