# Meditation Pathfinding Alternatives

## Problem Analysis
Distractions are getting stuck at the entrance and not following the maze because:
1. **Path junctions**: When paths cross, the same tile gets added multiple times with conflicting `nextX`/`nextY` directions
2. **Complex logic**: The `getPathDirection` function has too many edge cases and fallbacks
3. **Speed issue**: Movement speed multiplier (`0.5`) might be too slow
4. **Spawn location**: Distractions might spawn off-path and can't find the path

## Alternative Solutions

### **Alternative 1: Distance-Based Pathfinding (Recommended)**
**Concept**: Use Breadth-First Search (BFS) from center to mark distance from center for each path tile. Distractions always move to adjacent path tile with lower distance.

**Pros**:
- Simple and reliable
- Handles junctions automatically (always chooses path closer to center)
- Works even if distraction is slightly off-path
- Fast lookup (O(1) per tile)

**Cons**:
- Requires preprocessing step
- Slightly more memory (one distance value per tile)

**Implementation**:
- After path creation, run BFS from center
- Store distance from center in each path tile
- Distractions find adjacent path tiles and move to one with lowest distance

---

### **Alternative 2: Simplified Path Following**
**Concept**: Instead of complex pathfinding, snap distractions to nearest path tile, then always move toward the center using Manhattan distance.

**Pros**:
- Very simple implementation
- No complex pathfinding logic
- Works even if path structure is broken

**Cons**:
- Distractions might not follow the exact path (they'll take shortcuts if possible)
- Less "maze-like" behavior

**Implementation**:
- On spawn, snap to nearest path tile
- Each update, find all adjacent path tiles
- Move to adjacent path tile with smallest Manhattan distance to center

---

### **Alternative 3: Pre-computed Next-Tile Map**
**Concept**: Build a map where each path tile knows its "next" tile toward center, handling junctions by always choosing the tile closer to center.

**Pros**:
- Fast lookups
- Handles junctions correctly
- Maintains maze-like path following

**Cons**:
- Requires careful preprocessing to handle junctions
- More complex initialization

**Implementation**:
- After path creation, for each path tile, find all adjacent path tiles
- Choose the adjacent tile with smallest distance to center as "next"
- Store in map: `pathNextMap[${x},${y}] = {x, y}`

---

### **Alternative 4: A* Pathfinding**
**Concept**: Use A* algorithm to find optimal path from distraction's current position to center each frame.

**Pros**:
- Most robust pathfinding
- Guaranteed to find path if one exists
- Handles any path structure

**Cons**:
- Most computationally expensive
- Overkill for simple maze following
- Slower for many distractions

**Implementation**:
- Each distraction stores its A* path
- Recalculate path if stuck or every N frames
- Follow path step-by-step

---

### **Alternative 5: Fixed Movement Speed + Snap-to-Path**
**Concept**: Increase movement speed, improve snapping logic, and simplify path following.

**Pros**:
- Minimal changes to existing code
- Quick to implement
- Fixes immediate issues

**Cons**:
- Doesn't solve junction problem fundamentally
- Still might have edge cases

**Implementation**:
- Increase movement speed multiplier from `0.5` to `1.0` or `1.5`
- Improve snapping: if distance < 0.3, snap immediately
- Better spawn location validation: ensure distractions spawn on valid path tiles

---

## Recommendation

**I recommend Alternative 1 (Distance-Based Pathfinding)** because:
1. It's simple and reliable
2. Handles junctions automatically
3. Fast enough for real-time gameplay
4. Works even if distractions are slightly off-path
5. Easy to debug (can visualize distance values)

**Secondary choice**: Alternative 5 (Fixed Movement Speed + Snap-to-Path) if you want a quick fix with minimal changes.

## Implementation Details for Alternative 1

1. Add `pathDistances` map: `{x, y} -> distance from center`
2. After `initializePath()`, run BFS from center to all path tiles
3. Modify `getPathDirection()` to:
   - Find current position's nearest path tile
   - Find all adjacent path tiles (within 1 tile distance)
   - Return the adjacent path tile with lowest distance value
4. Increase movement speed multiplier from `0.5` to `1.0`
5. Ensure distractions spawn exactly on path tiles (no offset)

