# 🎨 Tailwind CSS 4.1 Setup Guide
## Complete Installation & Migration Instructions

**Date:** 2025-01-27  
**Version:** Tailwind CSS 4.1 (Latest)

---

## 📋 Prerequisites

- Node.js installed
- npm or yarn package manager
- Existing project structure

---

## 🚀 Step 1: Installation

```bash
# Install Tailwind CSS 4.1 and CLI
npm install -D tailwindcss@latest @tailwindcss/cli@latest

# Verify installation
npx tailwindcss --version
```

---

## 📁 Step 2: File Structure

The following files have been created:
- ✅ `css/tailwind.css` - Tailwind entry point with theme configuration

---

## ⚙️ Step 3: Update Build Process

### Option A: Using Tailwind CLI (Recommended)

Update `build.js` to include Tailwind processing:

```javascript
import { execSync } from 'child_process';

// Process Tailwind CSS
execSync('npx @tailwindcss/cli -i ./css/tailwind.css -o ./dist/css/tailwind.css', {
    stdio: 'inherit'
});
```

### Option B: Using PostCSS

If you prefer PostCSS:

```bash
npm install -D postcss postcss-cli autoprefixer
```

Create `postcss.config.js`:
```javascript
export default {
    plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {},
    },
};
```

---

## 🎨 Step 4: Update HTML

Update `index.html` to use Tailwind CSS:

```html
<!-- Replace main.css with tailwind.css -->
<link rel="stylesheet" href="/css/tailwind.css">
```

**Note:** Keep `main.css` during migration for gradual transition.

---

## 🔄 Step 5: Migration Strategy

### Phase 1: Coexistence (Week 5)
- Keep both `main.css` and `tailwind.css`
- Migrate one component at a time
- Test each migration

### Phase 2: Gradual Replacement (Week 6)
- Migrate all components
- Remove old CSS gradually
- Use Tailwind utilities for new features

### Phase 3: Cleanup (Week 7)
- Remove unused CSS
- Optimize Tailwind config
- Final testing

---

## ✨ Step 6: Use New Tailwind 4.1 Features

### Text Shadows
```html
<!-- Terminal text with glow -->
<span class="text-shadow-lg text-shadow-cyan-500/50">INIT...</span>
```

### Mask Utilities
```html
<!-- Fade effect -->
<div class="mask-b-from-20% mask-t-to-80%">
    Content with fade
</div>
```

### Pointer Variants
```html
<!-- Touch-optimized button -->
<button class="px-4 py-2 pointer-coarse:px-6 pointer-coarse:py-3">
    Touch Me
</button>
```

### Safe Alignment
```html
<!-- Prevents overflow -->
<nav class="flex justify-center-safe gap-2">
    <button>Tab 1</button>
    <button>Tab 2</button>
</nav>
```

---

## 🧪 Step 7: Testing

### Build Test
```bash
npm run build
# Check dist/css/tailwind.css is generated
```

### Visual Test
```bash
npm start
# Verify styles match original design
```

### Performance Test
- Check bundle size (should be smaller)
- Verify paint performance (should be same or better)
- Test on mobile (pointer variants should work)

---

## 📚 Migration Checklist

### Week 5: Core Components
- [ ] Install Tailwind CSS 4.1
- [ ] Create `css/tailwind.css`
- [ ] Update build process
- [ ] Migrate buttons
- [ ] Migrate cards
- [ ] Migrate layout components

### Week 6: Advanced Features
- [ ] Add text shadows to terminal text
- [ ] Implement mask utilities
- [ ] Add pointer variants for touch
- [ ] Use safe alignment
- [ ] Add colored drop shadows

### Week 7: Polish
- [ ] Remove old CSS
- [ ] Optimize Tailwind config
- [ ] Performance testing
- [ ] Documentation update

---

## 🐛 Troubleshooting

### Issue: Tailwind not generating CSS
**Solution:** Check that `@import "tailwindcss"` is at the top of `tailwind.css`

### Issue: Styles not applying
**Solution:** Ensure HTML is pointing to correct CSS file

### Issue: Build errors
**Solution:** Check Node.js version (requires Node 18+)

---

## 📖 Resources

- [Tailwind CSS 4.1 Docs](https://tailwindcss.com/docs)
- [Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Text Shadow Utilities](https://tailwindcss.com/docs/text-shadow)
- [Mask Utilities](https://tailwindcss.com/docs/mask-image)

---

## ✅ Success Criteria

- ✅ Tailwind CSS builds successfully
- ✅ Visual parity maintained
- ✅ Bundle size reduced
- ✅ New features working (text shadows, masks, etc.)
- ✅ Performance maintained or improved

---

**Ready to start migration!** Follow this guide step by step.

