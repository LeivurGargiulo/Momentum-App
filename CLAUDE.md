# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Momentum is a Progressive Web App (PWA) for tracking daily activities and building momentum, built with React, Tailwind CSS, and Zustand for state management. It works entirely offline with all data stored in localStorage.

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on localhost:5173)
npm run dev

# Build for production (includes PWA icon generation)
npm run build

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Tech Stack
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand (src/store/useStore.js)
- **Internationalization**: react-i18next with English and Spanish support
- **PWA**: Vite PWA plugin with service worker and offline support
- **Data Persistence**: Browser localStorage (no backend)
- **Charts**: Recharts for statistics visualization
- **Drag & Drop**: @dnd-kit for activity reordering
- **Date Handling**: date-fns with locale support

### Key Architectural Patterns

#### State Management
The application uses a single Zustand store (`src/store/useStore.js`) that manages:
- Activities list with drag-and-drop ordering
- Daily tracking data (completions, notes, mood, energy, journal entries)
- User settings (dark mode, language preferences)
- Onboarding state
- Date navigation

#### Data Persistence
All data operations go through utility functions in `src/utils/storage.js`:
- Activities, daily data, and settings are stored in separate localStorage keys
- Export/import functionality with conflict resolution
- Data validation and migration support
- Automatic data persistence on state changes

#### Component Structure
- **Main Navigation**: Tab-based navigation (Today, Statistics, Settings) with mobile-first design
- **Today View**: Daily activity tracking, mood/energy logging, journal entry
- **Statistics**: Activity completion rates, mood/energy trends, correlation analysis, journal timeline
- **Settings**: Dark mode, language switching, data management, reminders configuration

#### Internationalization Architecture
- Translation files in `src/locales/` (en.json, es.json)
- i18n configuration in `src/i18n.js`
- Language preference stored in localStorage
- Date formatting with locale support via date-fns
- Default activities dynamically loaded based on selected language

#### PWA Implementation
- Service worker for offline functionality and caching
- Manifest generation for app installation
- Update notifications when new versions are available
- Offline indicator component
- Install prompt for supported browsers

#### Reminders System
- Browser notifications API integration (`src/utils/reminders.js`)
- Reminders checked every minute while app is open
- Permission handling with user prompts
- Upcoming reminders display on main screen

## Key Files and Their Responsibilities

- `src/App.jsx` - Main app component with tab navigation and initialization
- `src/store/useStore.js` - Zustand store with all application state
- `src/utils/storage.js` - localStorage operations, export/import, data validation
- `src/utils/reminders.js` - Notifications and reminders functionality
- `src/i18n.js` - Internationalization configuration
- `src/components/Today.jsx` - Daily tracking interface
- `src/components/Statistics.jsx` - Analytics and trends visualization
- `src/components/Settings.jsx` - User preferences and data management
- `src/components/ImportConflictResolver.jsx` - Conflict resolution UI for data imports
- `vite.config.js` - Vite and PWA configuration

## Development Guidelines

### Adding New Features
1. Update Zustand store if new state is needed
2. Add corresponding storage functions in utils/storage.js
3. Include new data in export/import functionality
4. Add translations to both en.json and es.json
5. Consider mobile-first responsive design
6. Ensure offline functionality

### Working with Translations
- All user-facing text must use i18n translation keys
- Add new keys to both `src/locales/en.json` and `src/locales/es.json`
- Use the `useTranslation` hook: `const { t } = useTranslation()`
- Access translations with: `t('section.key')`

### PWA Considerations
- All assets must be cached by service worker
- Test offline functionality after changes
- Verify app installation works on mobile devices
- Check update notifications trigger correctly

### Data Migration
When changing data structures:
1. Update storage utility functions
2. Add migration logic to handle old data formats
3. Test import/export with old backup files
4. Update conflict resolution if needed

## Testing Approach

Currently, the project doesn't have automated tests configured. Manual testing should cover:
- PWA installation on mobile devices
- Offline functionality
- Data persistence across sessions
- Language switching
- Dark mode toggle
- Import/export with conflict resolution
- Reminders and notifications
- Drag-and-drop activity reordering

## Deployment

### Build Process
```bash
npm run build
```
- Generates PWA icons via scripts/generate-icons.cjs
- Creates service worker with Vite PWA plugin
- Builds optimized production bundle
- Generates web app manifest

### Deployment Platforms

#### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy automatically on push to main branch

#### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Deploy automatically or manually via CLI

#### GitHub Pages
1. Add homepage to package.json
2. Install gh-pages: `npm install --save-dev gh-pages`
3. Add deploy script: `"deploy": "gh-pages -d dist"`
4. Deploy: `npm run deploy`

#### Other Static Hosts
Any static file hosting service works since the app is client-side only.

### PWA Verification Checklist
- [ ] Manifest file loads correctly
- [ ] Service worker registers
- [ ] App can be installed
- [ ] Works offline
- [ ] Has appropriate icons
- [ ] Theme color matches design
- [ ] Update notifications work
- [ ] Lighthouse PWA score 90+

## Localization Implementation

### Current Languages
- 🇺🇸 **English** (default) - Complete UI translation
- 🇪🇸 **Spanish** (Español) - Complete UI translation with natural, consistent language

### Translation Structure
Total of 231 translation keys organized by section:
- `navigation.*` - Main navigation and tabs
- `onboarding.*` - Welcome screens and setup process (with language selection)
- `dailyTracking.*` - Daily activity tracking interface
- `statistics.*` - Statistics, analytics, and share functionality
- `settings.*` - Settings and configuration
- `journal.*` - Daily reflection journal
- `energy.*` - Energy level tracking
- `mood.*` - Mood tracking interface
- `reminders.*` - Reminders and notifications (with localized defaults)
- `pwa.*` - PWA-specific features
- `messages.*` - Success and confirmation messages
- `errors.*` - Error messages and validation
- `import.*` - Data import/export and conflict resolution
- `share.*` - Social sharing functionality
- `defaultActivities` - 10 pre-configured activities per language

### Language Features
- **Onboarding Language Selection**: First-time users choose language during setup
- **Persistent Preferences**: Language choice saved in localStorage
- **Date Localization**: Proper date formatting with date-fns locales
- **Default Activities**: Created in selected language from translation files
- **Fallback Handling**: Graceful degradation if translations fail to load

### Adding New Languages
1. Create translation file in `src/locales/` (e.g., `fr.json`)
2. Copy structure from existing translation file
3. Update `src/i18n.js` with new language configuration
4. Add to `getAvailableLanguages()` function
5. Test all UI elements and date formatting
6. Update default activities handling in store

## Feature Implementations

### Share Statistics Feature
- **Component**: `src/components/ShareStats.jsx`
- **Functionality**: Share activity progress via Web Share API or clipboard
- **Store Functions**: `getCurrentStreak()`, `getShareStatsData()`
- **Supports**: Mobile native sharing, desktop clipboard fallback
- **Includes**: Streak calculation, dynamic text generation, toast notifications

### Data Backup & Restore
- **Export**: Creates timestamped JSON backup with all user data
- **Import**: Validates and imports data with conflict resolution
- **Conflict Types**: Activity conflicts, daily data conflicts, settings conflicts
- **Resolution Options**: Skip, overwrite, or merge (for daily data)
- **Validation**: Ensures file integrity and proper data structure

### Mood & Energy Tracking
- **8 Mood Options**: Happy, Sad, Anxious, Calm, Neutral, Excited, Tired, Frustrated
- **5 Energy Levels**: Very Low to Very High with visual indicators
- **Analytics**: Trend analysis, correlation with activities
- **Storage**: Integrated with daily data in localStorage

### Daily Reflection Journal
- **Features**: 500 character limit, edit/save functionality
- **Timeline View**: Browse past entries chronologically
- **Search**: Find entries by keywords
- **Analytics**: Writing consistency tracking

### Reminders System
- **Default Reminders**: Morning Check-in (9 AM), Evening Review (8 PM)
- **Custom Reminders**: User-defined with time, label, and message
- **Limitations**: Only works when app is open (browser security)
- **Notifications**: Browser notifications API with permission handling
- **Localization**: Fully localized reminder labels and time formatting

## PWA Implementation Details

### Service Worker Configuration
- **Strategy**: Cache-first for static assets
- **Updates**: Automatic detection with user notification
- **Offline**: Full functionality without internet
- **Generated**: Via Vite PWA plugin in build process

### Web App Manifest
```json
{
  "name": "Momentum - Daily Activity Tracker",
  "short_name": "Momentum",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#3b82f6",
  "background_color": "#f9fafb"
}
```

### Viewport and Safe Area Handling
- Viewport meta tag with `viewport-fit=cover`
- CSS safe area insets for notched devices
- Overflow prevention for horizontal scroll
- Responsive design with mobile-first approach

## Performance Considerations

### Bundle Size (Production)
- Main bundle: ~668KB (gzipped: ~190KB)
- CSS: ~26KB (gzipped: ~5KB)
- Service Worker: ~1.4KB
- Manifest: ~472B

### Lighthouse Targets
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 95+

### Optimization Strategies
- localStorage for all data (no network requests)
- Service worker caching for offline support
- Responsive images with proper sizing
- CSS-in-JS avoided for better performance
- Minimal external dependencies

## Security & Privacy

### Data Privacy
- **Local Storage Only**: All data stays on user's device
- **No Analytics**: No tracking or telemetry
- **No External APIs**: No data sent to servers
- **No Cloud Sync**: Complete offline functionality

### Security Measures
- **HTTPS Required**: PWA features require secure connection
- **CSP Headers**: Content Security Policy for XSS prevention
- **No Sensitive Data**: No passwords or personal info stored
- **Input Validation**: All user inputs validated and sanitized

## Browser Support

### Minimum Requirements
- Chrome 67+ (Full PWA support)
- Firefox 67+ (Full PWA support)
- Safari 11.1+ (Limited PWA support)
- Edge 79+ (Full PWA support)

### Feature Support Matrix
- **Web Share API**: Mobile browsers only
- **Notifications**: All modern browsers (with permission)
- **PWA Install**: Chrome, Edge, Samsung Internet
- **Service Workers**: All modern browsers
- **localStorage**: Universal support