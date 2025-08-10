# Deployment Guide - Momentum PWA

This guide covers deploying the Momentum PWA to various platforms.

## Prerequisites

- Node.js 16+ installed
- Git repository set up
- Build completed successfully (`npm run build`)

## Vercel Deployment (Recommended)

### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Vite project
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Netlify Deployment

### Automatic Deployment
1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

## GitHub Pages

1. Add to `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/your-repo-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

2. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

3. Deploy:
```bash
npm run deploy
```

## Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init hosting
```

3. Configure:
- Public directory: `dist`
- Single-page app: Yes
- GitHub Actions: Optional

4. Deploy:
```bash
npm run build
firebase deploy
```

## PWA Verification

After deployment, verify your PWA:

### Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit with PWA checkbox enabled
4. Ensure PWA score is 90+

### Manual Testing
1. Open app in Chrome/Edge
2. Check for install prompt
3. Test offline functionality
4. Verify service worker registration

### PWA Checklist
- [ ] Manifest file loads correctly
- [ ] Service worker registers
- [ ] App can be installed
- [ ] Works offline
- [ ] Has appropriate icons
- [ ] Theme color matches design

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed
- Check Node.js version compatibility
- Verify PWA plugin configuration

### PWA Issues
- Check manifest.webmanifest is accessible
- Verify service worker registration
- Test on HTTPS (required for PWA)

### Performance Issues
- Optimize bundle size with code splitting
- Compress images and assets
- Enable gzip compression on server

## Environment Variables

No environment variables are required as this is a client-side only app.

## Custom Domain

1. Configure custom domain in your hosting platform
2. Update manifest.webmanifest if needed
3. Ensure HTTPS is enabled
4. Test PWA functionality on custom domain

## Updates

The PWA will automatically update when:
1. New version is deployed
2. Service worker detects changes
3. User refreshes the app

Users will be notified of updates via the UpdateNotification component.