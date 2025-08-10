# Momentum - Activity Tracker PWA

A mobile-first Progressive Web App (PWA) for tracking daily activities and building momentum. Built with React, Tailwind CSS, and designed to work entirely offline. Now with full localization support for English and Spanish.

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
- ✅ **Multi-Language Support**: English and Spanish with easy language switching
- ✅ **Localization**: Complete UI translation with react-i18next

## Languages Supported

- 🇺🇸 **English** (default)
- 🇪🇸 **Spanish** (Español)

### Language Switching

Users can easily switch between languages in the Settings page. The language preference is saved in localStorage and persists between sessions.

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

### Localization Development
The app uses react-i18next for internationalization. Key files:

- `src/i18n.js` - i18n configuration
- `src/locales/en.json` - English translations
- `src/locales/es.json` - Spanish translations
- `src/components/LanguageSwitcher.jsx` - Language switcher component

## Adding New Languages

To add support for a new language:

1. **Create translation file**: Add a new JSON file in `src/locales/` (e.g., `fr.json`)

2. **Add translations**: Copy the structure from `en.json` and translate all values:
```json
{
  "navigation": {
    "today": "Aujourd'hui",
    "stats": "Statistiques",
    "settings": "Paramètres"
  },
  // ... translate all other keys
}
```

3. **Update i18n configuration**: Add the new language to `src/i18n.js`:
```javascript
import frTranslations from './locales/fr.json';

// In the resources object:
resources: {
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  fr: { translation: frTranslations } // Add this line
}

// Update getAvailableLanguages function:
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' } // Add this line
  ];
};
```

4. **Test the new language**: Switch to the new language in the app and verify all translations work correctly.

### Translation Keys Structure

The app uses nested translation keys for better organization:

- `navigation.*` - Navigation labels
- `onboarding.*` - Onboarding flow text
- `dailyTracking.*` - Daily tracking interface
- `statistics.*` - Statistics and charts
- `settings.*` - Settings page
- `messages.*` - Success/error messages
- `errors.*` - Error messages
- `pwa.*` - PWA-specific text
- `activityManager.*` - Activity management interface

## Data Storage

All user data is stored locally in the browser:

- **Activities**: List of user-defined activities
- **Daily Data**: Completion status for each day
- **Settings**: User preferences (dark mode, language, etc.)

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
4. Test PWA functionality and localization
5. Submit a pull request

### Contributing Translations

To contribute translations:

1. Fork the repository
2. Add or update translation files in `src/locales/`
3. Test the translations in the app
4. Submit a pull request with your changes

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