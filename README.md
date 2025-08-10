# Momentum - Activity Tracker PWA

A mobile-first Progressive Web App (PWA) for tracking daily activities and building momentum. Built with React, Tailwind CSS, and designed to work entirely offline. Now with full localization support for English and Spanish and comprehensive data backup/restore functionality.

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
- ✅ **Data Backup & Restore**: Full offline data export/import with conflict resolution
- ✅ **Conflict Resolution**: Smart handling of data conflicts during import

## Languages Supported

- 🇺🇸 **English** (default)
- 🇪🇸 **Spanish** (Español)

### Language Switching

Users can easily switch between languages in the Settings page. The language preference is saved in localStorage and persists between sessions.

## Data Backup & Restore

Momentum includes comprehensive data backup and restore functionality that works entirely offline.

### Exporting Your Data

1. **Navigate to Settings**: Open the app and go to the Settings page
2. **Export Data**: Tap the "Export Data" button in the Data Management section
3. **Download**: A JSON file will be automatically downloaded with a timestamped filename (e.g., `momentum_backup_2025-01-15_14-30-25.json`)

The exported file contains:
- All your activities and their order
- Complete daily tracking data with completion status and notes
- App settings (dark mode, language preference)
- Export metadata (timestamp, version, data summary)

### Importing/Restoring Data

1. **Navigate to Settings**: Open the app and go to the Settings page
2. **Import Data**: Tap the "Import Data" button in the Data Management section
3. **Select File**: Choose a previously exported JSON backup file
4. **Resolve Conflicts**: If conflicts are detected, the app will guide you through resolution options

### Conflict Resolution

When importing data, Momentum intelligently detects and helps you resolve conflicts:

#### Activity Conflicts
- **Same ID**: When an imported activity has the same ID as an existing one
- **Same Name**: When an imported activity has the same name as an existing one
- **Resolution Options**:
  - Skip imported activity (keep existing)
  - Overwrite existing activity with imported data

#### Daily Data Conflicts
- **Same Date**: When you already have data for a specific date
- **Resolution Options**:
  - Skip imported data (keep existing)
  - Overwrite existing data with imported data
  - Merge data (combine completed activities and append notes)

#### Settings Conflicts
- **Existing Settings**: When you already have app settings configured
- **Resolution Options**:
  - Keep existing settings
  - Overwrite with imported settings

### Data Validation

The app validates all imported files to ensure:
- Valid JSON format
- Required data structure
- Proper data types
- Export metadata integrity

Invalid files will show a clear error message explaining the issue.

### Backup Best Practices

1. **Regular Backups**: Export your data weekly or monthly
2. **Multiple Copies**: Keep backups in different locations (cloud storage, local files)
3. **Test Restores**: Periodically test importing a backup to ensure it works
4. **Version Compatibility**: Backups are compatible across app versions

### File Format

Backup files are standard JSON with the following structure:
```json
{
  "activities": [...],
  "dailyData": {...},
  "settings": {...},
  "exportDate": "2025-01-15T14:30:25.123Z",
  "version": "2.0.0",
  "appName": "Momentum",
  "dataSummary": {
    "totalActivities": 5,
    "totalDays": 30,
    "dateRange": {
      "start": "2024-12-15",
      "end": "2025-01-15"
    }
  }
}
```

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

### Data Management Development
The app includes comprehensive data management utilities. Key files:

- `src/utils/storage.js` - Core storage functions with export/import
- `src/components/ImportConflictResolver.jsx` - Conflict resolution UI
- `src/components/Settings.jsx` - Settings page with data management

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
- `import.*` - Import/export and conflict resolution text

## Data Storage

All user data is stored locally in the browser:

- **Activities**: List of user-defined activities with IDs and order
- **Daily Data**: Completion status and notes for each day
- **Settings**: User preferences (dark mode, language, etc.)

### Data Export/Import
The app supports comprehensive data export and import via JSON files in the Settings section, including:

- **Smart Conflict Detection**: Automatically identifies data conflicts
- **Flexible Resolution**: Multiple options for handling conflicts
- **Data Validation**: Ensures backup file integrity
- **Metadata Tracking**: Includes export timestamps and version info

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
- Full backup/restore functionality works offline

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