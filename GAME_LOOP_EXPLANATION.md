# 🎮 Main Game Loop Explanation

## Overview

The game loop is the core idle game mechanic that automatically generates resources over time.

## Loop Structure

```
Every 100ms (10 times per second):
  1. Calculate time delta (how much time passed)
  2. Update buffs (count down temporary bonuses)
  3. Calculate production from all workstations
  4. Apply production (add resources/AB to inventory)
  5. Auto-save check (every 30 seconds)
```

## Production Calculation Flow

```
For each owned workstation:
  1. Get base production rate (e.g., 0.30 wax_block/s)
  2. Apply all multipliers:
     - Global upgrades (e.g., ×1.5)
     - Producer-specific upgrades (e.g., ×2.0)
     - Prestige bonuses (e.g., +10% per level)
     - Active buffs (e.g., +15% for 10 minutes)
  3. Multiply by owned count (e.g., 5 workstations)
  4. Multiply by delta time (e.g., 0.1 seconds)
  5. Add to inventory/AB
```

## Example

Let's say you own **5 Wax Melters**:

1. **Base rate**: 0.30 wax_block per second
2. **Multipliers applied**:
   - Global upgrade: ×1.5
   - Prestige bonus: +10% (×1.1)
   - Total multiplier: ×1.65
3. **Final calculation**:
   - Rate per workstation: 0.30 × 1.65 = 0.495 wax_block/s
   - Rate for all: 0.495 × 5 = 2.475 wax_block/s
   - Per tick (100ms): 2.475 × 0.1 = 0.2475 wax_block
   - Over 10 ticks (1 second): 2.475 wax_block total

## Key Code Locations

**Game Loop** (`js/gameState.js`):
- `startTickLoop()` - Starts the loop
- `tick()` - Main loop function (runs every 100ms)
- `calculateTotalProduction(delta)` - Calculates all production
- `getProductionMultiplier(workstationId)` - Calculates multipliers

**UI Updates** (`js/game.js`):
- Updates AB display every second (separate from game loop)
- Updates UI when workstations are crafted
- Updates inventory when items change

## Why 10 Ticks Per Second?

- **Smooth updates**: Resources accumulate smoothly
- **Performance**: Not too frequent (not every frame)
- **Balance**: Good balance between responsiveness and performance
- **Idle game standard**: Common tick rate for idle games

## Production Formula

```
Production = BaseRate × Multiplier × Owned × DeltaTime

Where:
- BaseRate = Per-second production rate (e.g., 0.30/s)
- Multiplier = All multipliers combined (upgrades, prestige, buffs)
- Owned = Number of workstations owned
- DeltaTime = Time elapsed since last tick (usually 0.1 seconds)
```

## Visual Example

```
Time: 0.0s
  Wax Melter (5 owned) produces: 0.2475 wax_block
  Inventory: { wax_block: 0.2475 }

Time: 0.1s
  Wax Melter (5 owned) produces: 0.2475 wax_block
  Inventory: { wax_block: 0.495 }

Time: 0.2s
  Wax Melter (5 owned) produces: 0.2475 wax_block
  Inventory: { wax_block: 0.7425 }

...continues every 0.1 seconds...
```

## Important Notes

1. **Delta time**: Uses actual elapsed time, so if the browser tab is inactive or slow, it still calculates correctly
2. **Offline progress**: When you return, calculates what you would have earned (capped at 12 hours)
3. **Multipliers stack**: All multipliers multiply together (multiplicative, not additive)
4. **Per-second rates**: All production rates are defined as "per second", then scaled by delta time

## Debugging the Loop

To see the loop in action, open browser console and add:

```javascript
// See production every tick
const originalTick = GameState.prototype.tick;
GameState.prototype.tick = function() {
    const production = this.calculateTotalProduction(0.1);
    console.log('Tick production:', production);
    originalTick.call(this);
};
```

Or check the AB per second display in the UI - it updates every second with the current production rate!

