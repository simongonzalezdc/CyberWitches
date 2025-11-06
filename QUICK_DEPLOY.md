# Quick Deployment Guide

## Fastest Way to Deploy

### 1. Build for Production
```bash
npm run build:prod
```

### 2. Test Build Locally
```bash
npm run preview
```

Visit `http://localhost:3000` to test the production build.

### 3. Deploy `dist/` Directory

Upload the entire contents of the `dist/` directory to your web hosting service.

## Deployment Platforms

### Netlify (Easiest)
1. Connect GitHub repository
2. Build command: `npm run build:prod`
3. Publish directory: `dist`
4. Deploy!

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### GitHub Pages
1. Build: `npm run build:prod`
2. Push `dist/` to `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Traditional Web Server
1. Build: `npm run build:prod`
2. Upload all files from `dist/` to web root
3. Ensure server serves `index.html` for all routes (SPA)

## Important Notes

- ✅ All files needed are in `dist/` after build
- ✅ Service worker is included and will work offline
- ✅ PWA manifest is configured
- ✅ All images and assets are included
- ✅ External CDN dependency: Tone.js (loaded automatically)

## Post-Deployment

1. Test game loads correctly
2. Test all buttons work
3. Test save/load functionality
4. Test offline mode
5. Test PWA installation

## Troubleshooting

**Build fails**: Check Node.js version (16+), clear node_modules, reinstall
**Files missing**: Run `npm run build:prod` again
**Service worker not working**: Check HTTPS is enabled (required for service workers)
**Audio not working**: User interaction required first (browser autoplay policy)

For detailed deployment instructions, see `DEPLOYMENT_CHECKLIST.md` and `docs/DEPLOYMENT.md`

