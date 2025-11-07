# Debugging Backgrounds and Music

## Quick Check

Open your browser console (F12) and run:

```javascript
// Check current tier
console.log('Current Tier:', window.designTierSystem?.getCurrentTier());
console.log('Body Classes:', document.body.className);
console.log('Audio Enabled:', window.audioSystem?.musicEnabled);
console.log('Audio Context State:', window.audioSystem?.audioContext?.state);

// Check if Tier 3+ is unlocked
console.log('Unlocked Tiers:', window.designTierSystem?.getUnlockedTiers());
```

## Requirements

- **Backgrounds**: Require **Tier 3+**
- **Music**: Requires **Tier 4**

## To See Backgrounds and Music

1. **Go to Settings tab**
2. **Find "Design Tier" section**
3. **Select Tier 3 or Tier 4** (if unlocked)
4. **Click anywhere on the page** to unlock audio

## Unlock Requirements

- **Tier 1**: First achievement or 100 AB
- **Tier 2**: First prestige or 1,000 AB
- **Tier 3**: Second prestige or 10,000 AB
- **Tier 4**: Third prestige or 100,000 AB

## Quick Test (Force Tier 4)

In browser console:
```javascript
// Force unlock Tier 4
window.designTierSystem.unlockTier(4);
window.designTierSystem.applyTier(4);
// Then click anywhere to unlock audio
```

