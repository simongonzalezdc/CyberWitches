# Cyber Witches: Idle Coven - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] All buttons working and tested
- [x] No console errors in production build
- [x] All JavaScript files properly minified
- [x] Service worker configured and updated
- [x] Manifest.json configured correctly
- [x] All images and assets included
- [x] External dependencies (Tone.js) loaded from CDN

### ✅ Build Process
- [ ] Run production build: `npm run build:prod`
- [ ] Verify build output in `dist/` directory
- [ ] Test build locally: `npm run preview`
- [ ] Check all files are present in dist/
- [ ] Verify service worker registration works
- [ ] Test offline functionality

### ✅ Testing
- [ ] Test all game features work
- [ ] Test all buttons are functional
- [ ] Test save/load functionality
- [ ] Test audio system (sound effects and music)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Test PWA installation
- [ ] Test offline mode

### ✅ Performance
- [ ] Check bundle sizes are reasonable
- [ ] Verify images are optimized
- [ ] Check loading times
- [ ] Verify virtual scrolling works
- [ ] Check memory usage
- [ ] Verify no memory leaks

### ✅ Security
- [ ] No sensitive data in code
- [ ] No API keys exposed
- [ ] HTTPS configured (for production)
- [ ] Content Security Policy configured (if needed)
- [ ] Service worker scope is correct

### ✅ Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators visible

## Build Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Production
```bash
npm run build:prod
```

This will:
- Minify all JavaScript files
- Remove console.log statements
- Optimize code
- Copy all static files to `dist/`
- Copy images and assets to `dist/`

### 3. Test Build Locally
```bash
npm run preview
```

This serves the `dist/` directory on `http://localhost:3000`

### 4. Verify Build Output
Check that `dist/` contains:
- `index.html`
- `styles.css`
- `manifest.json`
- `sw.js`
- `js/` directory with all JavaScript files
- `images/` directory with all images
- `icons/` directory with all icons
- `docs/` directory (optional)

## Deployment Options

### Option 1: Static Hosting (Recommended)

#### Netlify
1. Connect repository to Netlify
2. Build command: `npm run build:prod`
3. Publish directory: `dist`
4. Deploy automatically on push to main branch

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow prompts to configure

#### GitHub Pages
1. Build: `npm run build:prod`
2. Push `dist/` to `gh-pages` branch
3. Configure GitHub Pages to serve from `gh-pages` branch

### Option 2: Traditional Web Server
1. Build: `npm run build:prod`
2. Upload `dist/` contents to web server root
3. Configure server to serve `index.html` for all routes (SPA routing)
4. Ensure HTTPS is enabled
5. Configure proper MIME types

## Post-Deployment Verification

### ✅ Functionality
- [ ] Game loads correctly
- [ ] All tabs work
- [ ] Cast button works
- [ ] Auto-cast works
- [ ] Workstations can be crafted
- [ ] Upgrades can be purchased
- [ ] Experiments work
- [ ] Meditation works (if unlocked)
- [ ] Coven system works (if unlocked)
- [ ] Save/load works
- [ ] Audio works (sound effects and music)

### ✅ Performance
- [ ] Page loads in < 3 seconds
- [ ] No lag during gameplay
- [ ] Smooth animations
- [ ] Acceptable memory usage

### ✅ PWA Features
- [ ] Installable as PWA
- [ ] Works offline
- [ ] Service worker active
- [ ] App icon displays correctly
- [ ] Splash screen works

### ✅ Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Rollback Plan

If issues are discovered:
1. Revert to previous version in git
2. Rebuild: `npm run build:prod`
3. Redeploy `dist/` directory
4. Clear browser cache if needed

## Maintenance

### Regular Tasks
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Update dependencies monthly
- [ ] Review and update service worker cache version when needed
- [ ] Backup save data (if using cloud save)

### Version Updates
When updating the game:
1. Update version in `package.json`
2. Update cache version in `sw.js` (increment CACHE_NAME)
3. Test all features
4. Build and deploy

## Troubleshooting

### Common Issues

**Issue**: Service worker not updating
- **Solution**: Increment CACHE_NAME in sw.js and clear browser cache

**Issue**: Build fails
- **Solution**: Check Node.js version (16+), clear node_modules, reinstall

**Issue**: Assets not loading
- **Solution**: Check file paths, ensure all files are in dist/

**Issue**: Audio not working
- **Solution**: Check browser autoplay policies, ensure user interaction first

**Issue**: Buttons not working
- **Solution**: Check console for errors, verify event handlers are attached

## Files to Never Commit

- `node_modules/`
- `dist/` (build output)
- `.env` files
- `.DS_Store`
- `*.log` files
- Backup files

## Production Environment Variables

No environment variables currently needed - the game is fully client-side.

## CDN Dependencies

The game uses:
- Tone.js: Loaded from `https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js`

Ensure this CDN is accessible in your deployment environment.

## Support

For deployment issues, check:
- `docs/DEPLOYMENT.md` - Detailed deployment guide
- `docs/API.md` - API documentation
- Browser console for errors
- Service worker status in DevTools
