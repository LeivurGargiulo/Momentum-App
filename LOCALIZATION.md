# Localization Implementation Guide

## Overview

The Momentum PWA has been fully localized with support for English and Spanish. The implementation uses `react-i18next` for internationalization and provides a seamless user experience with language switching.

## Implementation Details

### Technology Stack

- **react-i18next**: Main internationalization library
- **i18next**: Core i18n framework
- **i18next-browser-languagedetector**: Automatic language detection
- **localStorage**: Language preference persistence

### File Structure

```
src/
├── i18n.js                    # i18n configuration
├── locales/
│   ├── en.json               # English translations
│   └── es.json               # Spanish translations
└── components/
    ├── LanguageSwitcher.jsx  # Language switcher component
    ├── Settings.jsx          # Updated with language switcher
    ├── Navigation.jsx        # Updated with translations
    ├── Today.jsx             # Updated with translations
    ├── Statistics.jsx        # Updated with translations
    ├── Onboarding.jsx        # Updated with translations
    ├── ActivityManager.jsx   # Updated with translations
    ├── PWAInstallPrompt.jsx  # Updated with translations
    ├── OfflineIndicator.jsx  # Updated with translations
    └── UpdateNotification.jsx # Updated with translations
```

## Translation Keys Structure

The app uses a hierarchical structure for translation keys:

### Navigation
```json
{
  "navigation": {
    "today": "Today",
    "stats": "Statistics", 
    "settings": "Settings"
  }
}
```

### Onboarding
```json
{
  "onboarding": {
    "welcome": "Welcome to Momentum",
    "welcomeSubtitle": "Build momentum, one day at a time",
    "getStarted": "Get Started",
    "addActivity": "Add Activity",
    "editActivity": "Edit Activity",
    "activityName": "Activity Name",
    "saveActivity": "Save Activity",
    "deleteActivity": "Delete Activity",
    "cancel": "Cancel"
  }
}
```

### Daily Tracking
```json
{
  "dailyTracking": {
    "todayActivities": "Today's Activities",
    "noActivities": "No activities for today",
    "markComplete": "Mark as complete",
    "markIncomplete": "Mark as incomplete",
    "notes": "Notes",
    "notesPlaceholder": "How are you feeling today? Any thoughts or reflections...",
    "saveNotes": "Save Notes"
  }
}
```

### Statistics
```json
{
  "statistics": {
    "completionRate": "Completion Rate",
    "daily": "Daily",
    "weekly": "Weekly",
    "monthly": "Monthly",
    "mostCompleted": "Most Completed",
    "leastCompleted": "Least Completed",
    "totalActivities": "Total Activities",
    "completedActivities": "Completed Activities",
    "completionPercentage": "Completion %",
    "noData": "No data available"
  }
}
```

### Settings
```json
{
  "settings": {
    "exportData": "Export Data",
    "importData": "Import Data",
    "clearData": "Clear All Data",
    "darkMode": "Dark Mode",
    "lightMode": "Light Mode",
    "about": "About",
    "version": "Version 2.0.0",
    "language": "Language",
    "english": "English",
    "spanish": "Español"
  }
}
```

### Messages & Errors
```json
{
  "messages": {
    "dataExported": "Data exported successfully",
    "dataImported": "Data imported successfully",
    "dataCleared": "All data cleared",
    "confirmClearData": "Are you sure you want to clear all data? This cannot be undone.",
    "activityAdded": "Activity added successfully",
    "activityUpdated": "Activity updated successfully",
    "activityDeleted": "Activity deleted successfully",
    "notesSaved": "Notes saved successfully"
  },
  "errors": {
    "errorLoadingData": "Error loading data",
    "errorSavingData": "Error saving data",
    "errorExportingData": "Error exporting data",
    "errorImportingData": "Error importing data"
  }
}
```

### PWA Components
```json
{
  "pwa": {
    "installTitle": "Install Momentum",
    "installDescription": "Add to your home screen for quick access and offline use",
    "install": "Install",
    "maybeLater": "Maybe later",
    "offline": "Offline",
    "updateAvailable": "Update Available",
    "updateDescription": "A new version is ready to install",
    "refresh": "Refresh"
  }
}
```

### Activity Manager
```json
{
  "activityManager": {
    "addNewActivity": "Add a new activity",
    "activityNamePlaceholder": "Enter activity name...",
    "noActivitiesYet": "No activities yet",
    "confirmDelete": "Are you sure you want to delete this activity?",
    "saving": "Saving..."
  }
}
```

## Spanish Translations

All UI text has been translated to Spanish, including:

### Key Translations
- **Add** → **Añadir**
- **Edit** → **Editar**
- **Delete** → **Eliminar**
- **Save** → **Guardar**
- **Cancel** → **Cancelar**
- **Activities** → **Actividades**
- **Today** → **Hoy**
- **Statistics** → **Estadísticas**
- **Settings** → **Configuración**
- **No activities yet** → **Aún no hay actividades**
- **Mark as done** → **Marcar como hecho**
- **Completion rate** → **Tasa de completitud**
- **Add a new activity** → **Añadir una nueva actividad**

### Default Activities (Spanish)
- Take medication → Tomar medicación
- Exercise → Ejercicio
- Meditation → Meditación
- Journal → Diario
- Call a friend → Llamar a un amigo
- Go outside → Salir al exterior
- Read → Leer
- Practice gratitude → Practicar gratitud
- Eat healthy meals → Comer comidas saludables
- Get enough sleep → Dormir lo suficiente

## Language Switching Implementation

### Language Switcher Component

The `LanguageSwitcher` component provides an intuitive interface for switching languages:

```jsx
const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();
  const availableLanguages = getAvailableLanguages();

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {t('settings.language')}
        </span>
      </div>
      
      <div className="flex gap-2">
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              currentLanguage === language.code
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
            }`}
          >
            {language.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Language Persistence

Language preferences are stored in localStorage and persist between sessions:

```javascript
// Save language preference
const saveLanguage = (language) => {
  try {
    localStorage.setItem('momentum-language', language);
  } catch (error) {
    console.error('Error saving language preference:', error);
  }
};

// Get saved language preference
const getSavedLanguage = () => {
  try {
    return localStorage.getItem('momentum-language') || 'en';
  } catch (error) {
    return 'en';
  }
};
```

## Component Updates

All components have been updated to use the `useTranslation` hook:

### Before (using strings.js)
```jsx
import { strings } from '../strings';

const Component = () => {
  return <h1>{strings.settings}</h1>;
};
```

### After (using react-i18next)
```jsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  return <h1>{t('settings.settings')}</h1>;
};
```

## Default Activities Language Support

The store has been updated to provide default activities in the user's selected language:

```javascript
setupDefaultActivities: () => {
  const currentLanguage = localStorage.getItem('momentum-language') || 'en';
  let defaultActivities = [];
  
  if (currentLanguage === 'es') {
    defaultActivities = [
      'Tomar medicación',
      'Ejercicio',
      // ... Spanish activities
    ];
  } else {
    defaultActivities = [
      'Take medication',
      'Exercise',
      // ... English activities
    ];
  }
  
  // Create activities with translated names
  const activities = defaultActivities.map((name, index) => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name,
    order: index
  }));
  
  set({ activities, isOnboarded: true });
  saveActivities(activities);
}
```

## UI/UX Considerations

### Layout Adaptations

The UI has been designed to accommodate longer Spanish text:

- **Button widths**: Flexible button sizing to accommodate longer text
- **Text wrapping**: Proper text wrapping for longer translations
- **Spacing**: Adjusted spacing to maintain visual balance
- **Responsive design**: Mobile-first approach ensures good layout on all screen sizes

### Language Detection

The app includes automatic language detection:

1. **localStorage**: Checks for saved language preference
2. **Browser language**: Falls back to browser's preferred language
3. **Default**: Uses English as final fallback

## Testing Localization

### Manual Testing Checklist

- [ ] Language switcher appears in Settings
- [ ] Language preference persists after page reload
- [ ] All UI text changes when language is switched
- [ ] Default activities are created in correct language
- [ ] Date formatting adapts to language (if applicable)
- [ ] PWA components show translated text
- [ ] Error messages and notifications are translated
- [ ] Form placeholders and labels are translated

### Automated Testing

Consider adding tests for:
- Translation key coverage
- Language switching functionality
- Default activities language selection
- localStorage persistence

## Performance Considerations

- **Bundle size**: Translation files are included in the main bundle
- **Runtime performance**: Minimal overhead from i18next
- **Caching**: Language preference is cached in localStorage
- **Lazy loading**: Consider lazy loading translations for larger apps

## Future Enhancements

### Potential Improvements

1. **More Languages**: Add support for French, German, Portuguese, etc.
2. **RTL Support**: Add support for right-to-left languages
3. **Date/Time Localization**: Proper date and time formatting per locale
4. **Number Formatting**: Localized number formatting
5. **Dynamic Loading**: Lazy load translation files
6. **Translation Management**: Integration with translation management systems

### Adding New Languages

See the README.md file for detailed instructions on adding new languages to the app.

## Conclusion

The Momentum PWA now provides a fully localized experience with:

- ✅ Complete English and Spanish translations
- ✅ Intuitive language switching
- ✅ Persistent language preferences
- ✅ Localized default activities
- ✅ Responsive UI design
- ✅ PWA functionality maintained
- ✅ Easy extensibility for new languages

The implementation follows best practices for internationalization and provides a solid foundation for adding more languages in the future.