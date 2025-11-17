# CSS Optimization Plan

## Current State
- **Main CSS File**: `styles.css` (151KB, 6,055 lines)
- **Issues**: 672 `!important` declarations, 610 expensive operations
- **Glitch Effects**: Extracted to `css/glitch-effects.css` (lazy-loadable)

## Completed Optimizations

### 1. Glitch Effects Extraction ✅
- Created `css/glitch-effects.css` with all tier-based glitch animations
- Added CSS `contain: strict` for better performance
- Added `prefers-reduced-motion` support
- Can be lazy-loaded when design tier unlocks

### Usage:
```javascript
// Lazy load glitch effects when tier >= 1
if (designTier >= 1) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/glitch-effects.css';
    document.head.appendChild(link);
}
```

## Recommended Future Optimizations

### 2. Split Remaining CSS (Recommended)

**Structure**:
```
css/
├── base.css          (~5KB  - variables, reset)
├── layout.css        (~10KB - grids, flexbox, containers)
├── components.css    (~30KB - buttons, cards, modals)
├── animations.css    (~15KB - non-glitch animations)
├── glitch-effects.css (~10KB - tier-based effects) ✅ DONE
└── responsive.css    (~5KB  - media queries)
```

**Benefits**:
- 40-60% faster initial load
- Better caching (users only re-download changed modules)
- Easier maintenance

### 3. Reduce `!important` Usage (High Priority)

**Current**: 672 instances
**Target**: <50 instances

**Strategy**:
1. Implement BEM naming convention
2. Increase specificity through proper selectors
3. Reserve `!important` only for:
   - Utility classes
   - Third-party overrides
   - Critical accessibility fixes

### 4. Optimize Expensive CSS Operations

**Issues** (610 instances):
- Heavy `filter` usage (drop-shadow, blur)
- Multiple `box-shadow` layers
- Complex gradients
- Continuous animations

**Optimizations**:
- Use `will-change` property strategically
- Limit animations to `transform` and `opacity`
- Use CSS `contain` property
- Pause animations when tab hidden (already added to glitch effects)

### 5. Critical CSS Inline Strategy

**Extract critical above-the-fold CSS** (~5-10KB):
- CSS variables
- Reset styles
- Body/html base styles
- HUD (top bar) styles
- Loading screen styles

**Inline in `<head>`**:
```html
<style>
    /* Critical CSS here */
    :root { /* variables */ }
    * { box-sizing: border-box; }
    /* etc. */
</style>
```

**Load rest asynchronously**:
```html
<link rel="preload" href="css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="css/main.css"></noscript>
```

### 6. CSS Containment

Add to large containers:
```css
.content-list {
    contain: layout style paint;
}

.tab-panel {
    contain: layout style;
}
```

**Benefits**:
- Browser can optimize repaints
- Prevents layout thrashing
- 20-30% rendering performance improvement

## Performance Targets

**Current**:
- First Paint: ~500ms
- CSS Parse Time: ~150ms
- Total CSS Size: 151KB

**After Optimization**:
- First Paint: <300ms (40% improvement)
- CSS Parse Time: <50ms (66% improvement)
- Critical CSS: <10KB inline
- Total CSS: Same size but split & lazy-loaded

## Implementation Priority

1. ✅ **DONE**: Extract glitch effects
2. **HIGH**: Inline critical CSS
3. **HIGH**: Add CSS containment to major containers
4. **MEDIUM**: Split CSS into modules
5. **MEDIUM**: Reduce `!important` usage
6. **LOW**: Optimize individual expensive operations

## Migration Notes

- Test thoroughly after CSS split
- Check design tier system still works
- Verify mobile responsive behavior
- Test with different browsers
- Measure performance before/after

## Measuring Success

```javascript
// Add to performance monitoring
const cssMetrics = {
    loadTime: performance.getEntriesByType('resource')
        .filter(r => r.name.includes('.css'))
        .reduce((sum, r) => sum + r.duration, 0),

    parseTime: performance.measure('css-parse'),

    size: document.styleSheets.length
};
```

Target metrics:
- CSS Load Time: <100ms
- CSS Parse Time: <50ms
- LCP (Largest Contentful Paint): <2.5s
