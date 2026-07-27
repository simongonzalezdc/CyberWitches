# Hex Compiler — Deployment Guide

This guide provides comprehensive instructions for deploying Hex Compiler to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Build Process](#build-process)
3. [Deployment Options](#deployment-options)
   - [Static Hosting](#static-hosting)
   - [Node.js Server](#nodejs-server)
   - [Docker Container](#docker-container)
   - [Serverless Functions](#serverless-functions)
4. [Environment Configuration](#environment-configuration)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js**: Version 18.14.0 or higher (matches `package.json` engines)
- **npm**: Version 9.0 or higher
- **Git**: For version control
- **Docker**: (Optional) Version 20.10 or higher

### Development Tools

- **Code Editor**: VS Code, WebStorm, or similar
- **Browser**: Chrome, Firefox, Safari, or Edge for testing
- **Terminal**: For command-line operations

### Domain and Hosting

- **Domain Name**: Registered domain name (for production)
- **SSL Certificate**: For HTTPS (recommended for production)
- **Hosting Provider**: Static hosting, VPS, or cloud platform

---

## Build Process

### Production (GitHub Pages)

Canonical play URL: **https://simongonzalezdc.github.io/CyberWitches/play.html**

Deploy is automated via `.github/workflows/deploy.yml` on push to **GitHub `main`**:
`npm ci` → `npm run build:prod` → upload `dist/`.

If Pages is stale while Forgejo is ahead: sync/push `main` to the GitHub remote and check the **Deploy** workflow (historically failed on incomplete `package-lock` after TypeScript major bumps).

### 1. Clone the Repository

```bash
# Prefer Forgejo SoT; GitHub is the Pages mirror
git clone git@git.kyanitelabs.tech:simon/CyberWitches.git
# or: git clone https://github.com/simongonzalezdc/CyberWitches.git
cd CyberWitches
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:coverage
npm run test:e2e
```

### 4. Build for Production

```bash
# Build for production
npm run build:prod

# Verify bundle size budget
npm run size-check
```

### 5. Optimize Build

```bash
# Optimize background images
npm run optimize:images
```

---

## Deployment Options

### Static Hosting

#### Netlify

1. **Connect Repository**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `16`

3. **Deploy**
   - Netlify will automatically deploy on push to main branch

4. **Custom Domain** (Optional)
   - Go to Site settings > Domain management
   - Add your custom domain

#### Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Project**
   - Follow prompts to configure project settings
   - Set custom domain if needed

#### GitHub Pages

1. **Configure Build**
   - In `package.json`, add:
   ```json
   "homepage": "https://yourusername.github.io/cyber-witches"
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm run deploy:gh-pages
   ```

#### AWS S3 + CloudFront

1. **Install AWS CLI**
   ```bash
   npm install -g aws-cli
   ```

2. **Configure S3 Bucket**
   ```bash
   aws s3 mb s3://cyber-witches-game --region us-east-1
   aws s3api put-public-access-block --bucket cyber-witches-game --public-read
   ```

3. **Deploy**
   ```bash
   npm run build
   aws s3 sync dist/ s3://cyber-witches-game --delete
   ```

4. **Configure CloudFront** (Optional)
   - Create CloudFront distribution
   - Set origin to S3 bucket
   - Configure custom domain and SSL

### Node.js Server

#### Basic Express Server

1. **Create Server File**
   ```javascript
   // server.js
   const express = require('express');
   const path = require('path');
   const compression = require('compression');
   
   const app = express();
   const PORT = process.env.PORT || 3000;
   
   // Compress responses
   app.use(compression());
   
   // Serve static files
   app.use(express.static(path.join(__dirname, 'dist')));
   
   // Start server
   app.listen(PORT, () => {
       console.log(`Server running on port ${PORT}`);
   });
   ```

2. **Install Dependencies**
   ```bash
   npm install express compression
   ```

3. **Start Server**
   ```bash
   node server.js
   ```

#### PM2 Process Management

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create Ecosystem File**
   ```json
   // ecosystem.config.json
   {
     "apps": [{
       "name": "cyber-witches",
       "script": "server.js",
       "instances": "max",
       "exec_mode": "cluster",
       "env": {
         "NODE_ENV": "production",
         "PORT": 3000
       }
     }]
   }
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.json
   ```

### Docker Container

#### Create Dockerfile

```dockerfile
# Use Node.js 16 Alpine
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S cyberwitches -u 1001

# Change ownership
RUN chown -R cyberwitches:nodejs /app

# Switch to non-root user
USER cyberwitches

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "server.js"]
```

#### Create Docker Compose File

```yaml
# docker-compose.yml
version: '3.8'

services:
  cyber-witches:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Build and Run

```bash
# Build image
docker build -t cyber-witches .

# Run container
docker run -p 3000:3000 cyber-witches

# Use Docker Compose
docker-compose up -d
```

### Serverless Functions

#### Vercel Serverless

1. **Create API Directory**
   ```bash
   mkdir api
   ```

2. **Create Serverless Function**
   ```javascript
   // api/index.js
   const { createHandler } = require('@vercel/node');
   
   module.exports = createHandler({
       // Serve static files
       public: true,
       // Directory to serve
       directory: 'dist'
   });
   ```

3. **Configure vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "dist/(.*)",
         "headers": {
           "cache-control": "public, max-age=31536000, immutable"
         }
       }
     ]
   }
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

#### AWS Lambda

1. **Install Serverless Framework**
   ```bash
   npm install -g serverless
   ```

2. **Create Serverless Configuration**
   ```yaml
   # serverless.yml
   service: cyber-witches
   
   provider:
     name: aws
     runtime: nodejs16.x
     region: us-east-1
   
   functions:
     app:
       handler: handler.handler
       events:
         - httpApi:
             path: /
             method: ANY
             cors: true
   
   plugins:
     - serverless-offline
     - serverless-domain-manager
   ```

3. **Create Handler**
   ```javascript
   // handler.js
   const fs = require('fs');
   const path = require('path');
   
   module.exports.handler = async (event) => {
       // For API requests
       if (event.httpMethod === 'GET' && event.path === '/api/data') {
           return {
               statusCode: 200,
               headers: {
                   'Content-Type': 'application/json',
                   'Access-Control-Allow-Origin': '*'
               },
               body: JSON.stringify({ message: 'API response' })
           };
       }
       
       // For static file serving
       const filePath = path.join(__dirname, 'dist', event.path);
       
       try {
           const data = fs.readFileSync(filePath);
           const contentType = getContentType(filePath);
           
           return {
               statusCode: 200,
               headers: {
                   'Content-Type': contentType
               },
               body: data
           };
       } catch (error) {
           return {
               statusCode: 404,
               body: 'File not found'
           };
       }
   };
   
   function getContentType(filePath) {
       const ext = path.extname(filePath).toLowerCase();
       const contentTypes = {
           '.html': 'text/html',
           '.css': 'text/css',
           '.js': 'application/javascript',
           '.json': 'application/json',
           '.png': 'image/png',
           '.jpg': 'image/jpeg',
           '.svg': 'image/svg+xml'
       };
       return contentTypes[ext] || 'text/plain';
   }
   ```

4. **Deploy**
   ```bash
   serverless deploy
   ```

---

## Environment Configuration

### Environment Variables

Create a `.env` file for environment-specific configuration:

```bash
# .env
NODE_ENV=production
PORT=3000
API_URL=https://api.cyberwitches.game
SAVE_KEY=your-secret-save-key
ANALYTICS_KEY=your-analytics-key
```

### Configuration Files

#### Production Configuration

```javascript
// config/production.js
module.exports = {
    env: 'production',
    port: process.env.PORT || 3000,
    api: {
        url: process.env.API_URL,
        timeout: 10000
    },
    save: {
        key: process.env.SAVE_KEY,
        interval: 300000 // 5 minutes
    },
    analytics: {
        key: process.env.ANALYTICS_KEY,
        enabled: true
    },
    performance: {
        monitoring: true,
        debugMode: false
    }
};
```

#### Staging Configuration

```javascript
// config/staging.js
module.exports = {
    env: 'staging',
    port: process.env.PORT || 3001,
    api: {
        url: process.env.API_URL || 'https://staging-api.cyberwitches.game',
        timeout: 10000
    },
    save: {
        key: process.env.SAVE_KEY || 'staging-key',
        interval: 60000 // 1 minute
    },
    analytics: {
        key: process.env.ANALYTICS_KEY || 'staging-analytics-key',
        enabled: true
    },
    performance: {
        monitoring: true,
        debugMode: true
    }
};
```

---

## Performance Optimization

### Build Optimization

#### Bundle Analysis

```bash
# Analyze bundle size
npm run build:analyze

# Check for large dependencies
npm run check:size
```

#### Code Splitting

```javascript
// webpack.config.js (if using webpack)
module.exports = {
    optimization: {
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 20000
        }
    }
};
```

#### Asset Optimization

```bash
# Optimize images
npm run optimize:images

# Generate critical CSS
npm run optimize:critical
```

### Runtime Optimization

#### Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'cyber-witches-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
```

#### Resource Hints

```html
<!-- index.html -->
<link rel="preload" href="/styles.css" as="style">
<link rel="preload" href="/app.js" as="script">
<link rel="dns-prefetch" href="//api.cyberwitches.game">
```

---

## Monitoring and Maintenance

### Application Monitoring

#### Error Tracking

```javascript
// Error tracking service integration
import { analytics } from './analytics.js';

window.addEventListener('error', (event) => {
    analytics.trackError(event.error, {
        context: 'global_error_handler',
        userAgent: navigator.userAgent,
        url: window.location.href
    });
});
```

#### Performance Monitoring

```javascript
// Performance monitoring
import { performanceMonitor } from './performanceMonitor.js';

// Initialize in production
if (process.env.NODE_ENV === 'production') {
    performanceMonitor.initialize(false);
}
```

### Health Checks

#### Health Check Endpoint

```javascript
// healthcheck.js
const http = require('http');

const options = {
    host: 'localhost',
    port: process.env.PORT || 3000,
    path: '/',
    timeout: 2000
};

const request = http.request(options, (res) => {
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

request.on('error', () => {
    process.exit(1);
});

request.end();
```

#### Docker Health Check

```dockerfile
# In Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
```

### Log Management

#### Structured Logging

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'cyber-witches' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

module.exports = logger;
```

#### Log Rotation

```bash
# Logrotate configuration
# /etc/logrotate.d/cyber-witches
/var/log/cyber-witches/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644
    postrotate
        systemctl reload rsyslog
    endscript
}
```

---

## Troubleshooting

### Common Issues

#### Build Errors

**Issue**: Module not found
```bash
# Solution
rm -rf node_modules
npm install
```

**Issue**: Build fails on memory
```bash
# Solution
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### Runtime Errors

**Issue**: CORS errors
```javascript
// Solution: Configure CORS properly
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
```

**Issue**: Save data corruption
```javascript
// Solution: Validate save data before loading
function loadSaveData(data) {
    try {
        // Validate data structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid save data');
        }
        
        // Validate required fields
        if (!data.version || !data.gameState) {
            throw new Error('Missing required save fields');
        }
        
        return data;
    } catch (error) {
        console.error('Failed to load save data:', error);
        return null;
    }
}
```

### Debugging Techniques

#### Remote Debugging

```javascript
// Enable remote debugging in development
if (process.env.NODE_ENV === 'development') {
    // Enable source maps
    process.env.GENERATE_SOURCEMAP = 'true';
    
    // Enable verbose logging
    process.env.LOG_LEVEL = 'debug';
}
```

#### Performance Profiling

```javascript
// Performance profiling
if (process.env.ENABLE_PROFILING) {
    const { performance } = require('perf_hooks');
    
    const perfObserver = new performance.PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
            console.log(`[PERF] ${entry.name}:`, entry.duration);
        });
    });
    
    perfObserver.observe({ entryTypes: ['measure', 'function'] });
}
```

---

## Security Considerations

### HTTPS Configuration

```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
}
```

### Environment Variable Security

```bash
# Use environment-specific secrets
# Never commit secrets to version control
# Use secret management services in production

# Example: AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id cyber-witches/save-key
```

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.cyberwitches.game;">
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Build optimized
- [ ] Environment variables configured
- [ ] Security measures implemented
- [ ] Backup strategy in place
- [ ] Monitoring tools configured
- [ ] Documentation updated

### Post-Deployment

- [ ] Application accessible
- [ ] All features working
- [ ] Performance metrics within acceptable range
- [ ] Error rates below threshold
- [ ] Security scans passed
- [ ] Monitoring alerts configured
- [ ] Rollback plan tested

### Continuous Deployment

#### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v2
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.1
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          netlify-auth-token: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## Rollback Strategy

### Version Control

```bash
# Tag releases for easy rollback
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Rollback to previous version
git checkout v0.9.0
git push -f origin main
```

### Database Rollback

```bash
# If using database with migrations
# Create backup before migration
mysqldump -u username -p database_name > backup.sql

# Rollback to backup
mysql -u username -p database_name < backup.sql
```

---

## Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Check error logs
   - Update dependencies
   - Review performance metrics
   - Security scan

2. **Monthly**
   - Update SSL certificates
   - Clean up old logs
   - Backup database
   - Review and update documentation

3. **Quarterly**
   - Security audit
   - Performance optimization review
   - Capacity planning
   - Disaster recovery test

### Emergency Procedures

1. **Service Outage**
   - Identify affected systems
   - Communicate with users
   - Implement rollback if needed
   - Document incident and resolution

2. **Security Incident**
   - Identify breach scope
   - Contain and assess damage
   - Communicate with stakeholders
   - Implement security measures
   - Document incident and lessons learned

---

## Conclusion

This deployment guide covers the most common deployment scenarios for Cyber Witches: Idle Coven. Choose the deployment method that best fits your requirements and infrastructure.

For additional help or questions, refer to the [API documentation](./API.md) or create an issue in the project repository.