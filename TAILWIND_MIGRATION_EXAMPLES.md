# 🎨 Tailwind CSS 4.1 Migration Examples
## Real Component Migration Guide

**Date:** 2025-01-27  
**Purpose:** Step-by-step examples for migrating existing components

---

## 📋 Migration Checklist

### Phase 1: Buttons (Day 2)
- [ ] Cast button (EXEC)
- [ ] Icon buttons
- [ ] Action buttons
- [ ] Tab buttons

### Phase 2: Cards (Day 3)
- [ ] Workstation cards
- [ ] Upgrade cards
- [ ] Spell cards
- [ ] Achievement cards

### Phase 3: Layout (Day 4)
- [ ] HUD
- [ ] Sidebar
- [ ] Tabs
- [ ] Grids

### Phase 4: Advanced Features (Day 5)
- [ ] Text shadows on terminal text
- [ ] Mask utilities for fade effects
- [ ] Pointer variants for touch
- [ ] Safe alignment for navigation

---

## 🔄 Component Migration Examples

### Example 1: Cast Button (EXEC)

**Before (components.css):**
```css
.btn-cast {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    border: 2px solid var(--color-code);
    color: var(--color-code);
    position: relative;
    cursor: pointer;
    transition: all 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.btn-cast:hover {
    background: rgba(0, 240, 255, 0.1);
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
}

.btn-cast:active {
    transform: scale(0.95);
}
```

**After (tailwind.css @layer components):**
```css
@layer components {
    .btn-cast {
        @apply relative w-[100px] h-[100px] rounded-full;
        @apply bg-black/50 border-2 border-code text-code;
        @apply flex flex-col items-center justify-center;
        @apply cursor-pointer transition-all duration-100;
        @apply drop-shadow-xl drop-shadow-cyan-500/20;
        @apply hover:bg-code/10 hover:drop-shadow-cyan-500/40;
        @apply active:scale-95;
        @apply pointer-coarse:w-[120px] pointer-coarse:h-[120px];
    }
}
```

**Benefits:**
- ✅ Uses new colored drop shadows
- ✅ Pointer variants for touch optimization
- ✅ Cleaner, more maintainable

---

### Example 2: Terminal Text with Glow

**Before:**
```css
.system-value {
    font-family: var(--font-mono);
    color: var(--color-code);
    text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}
```

**After:**
```html
<!-- In HTML -->
<span class="terminal-text">INIT...</span>
```

```css
@layer components {
    .terminal-text {
        @apply font-mono text-code;
        @apply text-shadow-lg text-shadow-cyan-500/50;
    }
}
```

**Benefits:**
- ✅ Uses new text-shadow utilities
- ✅ Colored shadows
- ✅ Consistent sizing

---

### Example 3: Workstation Card

**Before:**
```css
.workstation-card {
    background: var(--bg-panel);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.workstation-card-title {
    color: var(--color-code);
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 8px;
    text-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
}
```

**After:**
```css
@layer components {
    .workstation-card {
        @apply bg-panel border border-light rounded-lg p-4 mb-3;
        @apply drop-shadow-xl drop-shadow-cyan-500/10;
        @apply pointer-coarse:p-5;
    }
    
    .workstation-card-title {
        @apply text-code font-bold uppercase tracking-wider mb-2;
        @apply text-shadow-md text-shadow-cyan-500/40;
    }
}
```

**Benefits:**
- ✅ Text shadows on titles
- ✅ Colored drop shadows
- ✅ Touch optimization

---

### Example 4: Tab Navigation with Safe Alignment

**Before:**
```css
.tab-nav {
    display: flex;
    justify-content: center;
    gap: 8px;
    overflow-x: auto;
    padding: 0 16px;
}
```

**After:**
```css
@layer components {
    .tab-nav {
        @apply flex justify-center-safe gap-2;
        @apply overflow-x-auto px-4;
        @apply pointer-coarse:gap-3 pointer-coarse:px-5;
    }
}
```

**Benefits:**
- ✅ Safe alignment prevents overflow
- ✅ Pointer variants for touch
- ✅ Better mobile experience

---

### Example 5: Fade Effect with Mask Utilities

**Before:**
```css
.fade-bottom {
    mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
}
```

**After:**
```html
<!-- In HTML -->
<div class="fade-bottom mask-b-to-0%">
    Content with fade
</div>
```

**Or in CSS:**
```css
@layer components {
    .fade-bottom {
        @apply mask-b-to-0%;
    }
}
```

**Benefits:**
- ✅ Cleaner syntax
- ✅ Composable masks
- ✅ Better browser support

---

## 🎯 Migration Strategy

### Step 1: Install Tailwind
```bash
npm install -D tailwindcss@latest @tailwindcss/cli@latest
```

### Step 2: Update Build
Add Tailwind processing to `build.js`

### Step 3: Migrate One Component
1. Find component in `components.css`
2. Convert to Tailwind utilities
3. Add to `@layer components` in `tailwind.css`
4. Test visually
5. Remove old CSS

### Step 4: Add New Features
- Add text shadows to terminal text
- Add mask utilities for fade effects
- Add pointer variants for touch
- Use safe alignment for navigation

### Step 5: Remove Old CSS
Once all components migrated, remove old CSS files

---

## 📚 Reference Files

- `css/tailwind.css` - Tailwind entry point with theme
- `css/tailwind-examples.css` - More migration examples
- `TAILWIND_SETUP_GUIDE.md` - Setup instructions

---

**Ready to migrate!** Start with one component and work through the checklist.

