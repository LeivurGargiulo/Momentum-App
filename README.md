# Momentum - Activity Tracker PWA

A mobile-first Progressive Web App (PWA) for tracking daily activities and building momentum. Built with React, Tailwind CSS, and designed to work entirely offline.

## Features

- ✅ **Local-Only Data**: All data stored in browser localStorage - no server required
- ✅ **Progressive Web App**: Install on home screen, works offline
- ✅ **Mobile-First Design**: Optimized for mobile devices
- ✅ **Dark Mode Support**: Toggle between light and dark themes
- ✅ **Activity Management**: Add, edit, delete, and reorder activities
- ✅ **Daily Tracking**: Mark activities as complete for each day
- ✅ **Statistics**: View completion rates and activity performance
- ✅ **Offline-First**: Works without internet connection
- ✅ **Auto-Updates**: Notifies when new versions are available

## PWA Installation

### On Android (Chrome/Edge)
1. Open the app in Chrome or Edge browser
2. Tap the menu (⋮) in the top right
3. Select "Add to Home screen" or "Install app"
4. Follow the prompts to install

### On iOS (Safari)
1. Open the app in Safari browser
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to install

### On Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge browser
2. Look for the install icon (➕) in the address bar
3. Click "Install" to add to desktop

## Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### PWA Development
The app uses Vite PWA plugin for service worker generation and manifest creation. Key files:

- `vite.config.js` - PWA configuration
- `public/pwa-icon.svg` - App icon
- `src/components/PWAInstallPrompt.jsx` - Install prompt
- `src/components/OfflineIndicator.jsx` - Offline status
- `src/components/UpdateNotification.jsx` - Update notifications

## Data Storage

All user data is stored locally in the browser:

- **Activities**: List of user-defined activities
- **Daily Data**: Completion status for each day
- **Settings**: User preferences (dark mode, etc.)

### Data Export/Import
The app supports data export and import via JSON files in the Settings section.

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on push to main branch
3. The app will be served as static files

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure as a static site

### Other Static Hosts
Any static file hosting service will work since the app is client-side only.

## Offline Functionality

The app works completely offline after the first load:

- Service worker caches all app assets
- User data is stored in localStorage
- No network requests required for core functionality
- Automatic updates when connection is restored

## Browser Support

- Chrome 67+
- Firefox 67+
- Safari 11.1+
- Edge 79+

## Lighthouse Score

The app is optimized to achieve high Lighthouse scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 95+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test PWA functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions:
1. Check the browser console for errors
2. Ensure you're using a supported browser
3. Try clearing browser cache and data
4. Open an issue on GitHub

---

Built with ❤️ using React, Tailwind CSS, and Vite