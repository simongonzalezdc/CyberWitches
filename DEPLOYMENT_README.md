# Cyber Witches: Idle Coven - Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Production
```bash
npm run build:prod
```

### 3. Deploy
Upload the contents of the `dist/` folder to your web server.

## Build Process

The build script (`build.js`) performs the following:

1. **Copies static files**: HTML, CSS, manifest, service worker
2. **Copies directories**: icons, docs, images
3. **Builds JavaScript**: Minifies and optimizes all JS files
4. **Removes console logs**: In production builds (except console.error)
5. **Outputs to `dist/`**: All production-ready files

## Deployment Options

### Static Hosting (Recommended)

#### Netlify
1. Connect your repository
2. Build command: `npm run build:prod`
3. Publish directory: `dist`
4. Deploy!

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow prompts

#### GitHub Pages
1. Build: `npm run build:prod`
2. Push `dist/` contents to `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Traditional Web Server

1. Build: `npm run build:prod`
2. Upload `dist/` folder contents to web root
3. Configure server to serve `index.html` for all routes (SPA routing)
4. Enable HTTPS

## Important Configuration

### Server Configuration

For single-page applications (SPAs), configure your server to serve `index.html` for all routes:

**Apache (.htaccess)**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Service Worker

The service worker is automatically registered and caches all assets for offline support.

To update the service worker:
1. Change `CACHE_NAME` in `sw.js`
2. Rebuild: `npm run build:prod`
3. Deploy new version

## File Structure

After building, the `dist/` folder contains:

```
dist/
├── index.html
├── styles.css
├── manifest.json
├── sw.js
├── js/
│   └── [all JS files, minified]
├── icons/
│   └── [all icon files]
├── images/
│   └── [all image files]
└── docs/
    └── [documentation files]
```

## Verification

After deployment, verify:

1. ✅ Site loads correctly
2. ✅ All buttons work
3. ✅ Game saves/loads
4. ✅ Service worker registers
5. ✅ PWA can be installed
6. ✅ No console errors
7. ✅ Images load correctly

## Troubleshooting

### Images not loading
- Verify `images/` directory was copied to `dist/`
- Check image paths are relative (not absolute)
- Verify MIME types are correct

### Service worker not updating
- Clear browser cache
- Update `CACHE_NAME` in `sw.js`
- Rebuild and redeploy

### Routes return 404
- Configure server to serve `index.html` for all routes
- Check server configuration for SPA support

## Production Optimizations

The production build includes:
- ✅ Minified JavaScript
- ✅ Removed console.log statements
- ✅ Optimized file sizes
- ✅ Service worker caching
- ✅ PWA manifest

## Support

For issues or questions, refer to:
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Detailed checklist
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Comprehensive deployment guide
- [README.md](./README.md) - Project overview

