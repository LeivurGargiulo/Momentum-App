// Storage keys
const ACTIVITIES_KEY = 'activity-tracker-activities';
const DAILY_DATA_KEY = 'activity-tracker-daily-data';
const SETTINGS_KEY = 'activity-tracker-settings';

// Helper to format date as YYYY-MM-DD
export const formatDateKey = (date) => {
  return date.toISOString().split('T')[0];
};

// Helper to parse date from YYYY-MM-DD
export const parseDateKey = (dateKey) => {
  return new Date(dateKey + 'T00:00:00');
};

// Load activities from localStorage
export const loadActivities = () => {
  try {
    const stored = localStorage.getItem(ACTIVITIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading activities:', error);
    return [];
  }
};

// Save activities to localStorage
export const saveActivities = (activities) => {
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
    return true;
  } catch (error) {
    console.error('Error saving activities:', error);
    return false;
  }
};

// Load daily data for a specific date
export const loadDailyData = (dateKey) => {
  try {
    const stored = localStorage.getItem(DAILY_DATA_KEY);
    const allData = stored ? JSON.parse(stored) : {};
    return allData[dateKey] || { completed: [], notes: '' };
  } catch (error) {
    console.error('Error loading daily data:', error);
    return { completed: [], notes: '' };
  }
};

// Save daily data for a specific date
export const saveDailyData = (dateKey, data) => {
  try {
    const stored = localStorage.getItem(DAILY_DATA_KEY);
    const allData = stored ? JSON.parse(stored) : {};
    allData[dateKey] = data;
    localStorage.setItem(DAILY_DATA_KEY, JSON.stringify(allData));
    return true;
  } catch (error) {
    console.error('Error saving daily data:', error);
    return false;
  }
};

// Load all daily data
export const loadAllDailyData = () => {
  try {
    const stored = localStorage.getItem(DAILY_DATA_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading all daily data:', error);
    return {};
  }
};

// Load settings
export const loadSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { darkMode: false };
  } catch (error) {
    console.error('Error loading settings:', error);
    return { darkMode: false };
  }
};

// Save settings
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Validate backup data structure
export const validateBackupData = (data) => {
  try {
    // Check if data is an object
    if (!data || typeof data !== 'object') {
      return { isValid: false, error: 'Invalid data format' };
    }

    // Check for required fields
    const requiredFields = ['activities', 'dailyData', 'settings', 'exportDate', 'version'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return { isValid: false, error: `Missing required field: ${field}` };
      }
    }

    // Validate activities array
    if (!Array.isArray(data.activities)) {
      return { isValid: false, error: 'Activities must be an array' };
    }

    // Validate dailyData object
    if (typeof data.dailyData !== 'object' || data.dailyData === null) {
      return { isValid: false, error: 'Daily data must be an object' };
    }

    // Validate settings object
    if (typeof data.settings !== 'object' || data.settings === null) {
      return { isValid: false, error: 'Settings must be an object' };
    }

    // Validate export date
    if (isNaN(new Date(data.exportDate).getTime())) {
      return { isValid: false, error: 'Invalid export date' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Data validation failed' };
  }
};

// Detect conflicts between existing and imported data
export const detectConflicts = (importedData) => {
  const conflicts = {
    activities: [],
    dailyData: [],
    settings: false
  };

  const existingActivities = loadActivities();
  const existingDailyData = loadAllDailyData();
  const existingSettings = loadSettings();

  // Check for activity conflicts (same ID or name)
  importedData.activities.forEach(importedActivity => {
    const existingActivity = existingActivities.find(a => a.id === importedActivity.id);
    if (existingActivity) {
      conflicts.activities.push({
        type: 'id',
        imported: importedActivity,
        existing: existingActivity
      });
    } else {
      const nameConflict = existingActivities.find(a => a.name === importedActivity.name);
      if (nameConflict) {
        conflicts.activities.push({
          type: 'name',
          imported: importedActivity,
          existing: nameConflict
        });
      }
    }
  });

  // Check for daily data conflicts (same date)
  Object.keys(importedData.dailyData).forEach(dateKey => {
    if (existingDailyData[dateKey]) {
      conflicts.dailyData.push({
        dateKey,
        imported: importedData.dailyData[dateKey],
        existing: existingDailyData[dateKey]
      });
    }
  });

  // Check for settings conflicts (if settings exist)
  if (Object.keys(existingSettings).length > 0) {
    conflicts.settings = true;
  }

  return conflicts;
};

// Export all data as JSON with enhanced structure
export const exportData = () => {
  try {
    const activities = loadActivities();
    const dailyData = loadAllDailyData();
    const settings = loadSettings();
    
    const exportData = {
      activities,
      dailyData,
      settings,
      exportDate: new Date().toISOString(),
      version: '2.0.0',
      appName: 'Momentum',
      dataSummary: {
        totalActivities: activities.length,
        totalDays: Object.keys(dailyData).length,
        dateRange: {
          start: Object.keys(dailyData).length > 0 ? Math.min(...Object.keys(dailyData)) : null,
          end: Object.keys(dailyData).length > 0 ? Math.max(...Object.keys(dailyData)) : null
        }
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

// Import data with conflict resolution
export const importData = (jsonData, conflictResolution = {}) => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate the imported data
    const validation = validateBackupData(data);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Detect conflicts
    const conflicts = detectConflicts(data);
    
    // Apply conflict resolution
    let activitiesToImport = data.activities;
    let dailyDataToImport = data.dailyData;
    let settingsToImport = data.settings;

    // Handle activity conflicts
    if (conflicts.activities.length > 0) {
      activitiesToImport = data.activities.filter(importedActivity => {
        const conflict = conflicts.activities.find(c => c.imported.id === importedActivity.id);
        if (conflict) {
          return conflictResolution.activities?.[importedActivity.id] === 'overwrite';
        }
        return true;
      });
    }

    // Handle daily data conflicts
    if (conflicts.dailyData.length > 0) {
      Object.keys(data.dailyData).forEach(dateKey => {
        const conflict = conflicts.dailyData.find(c => c.dateKey === dateKey);
        if (conflict) {
          const resolution = conflictResolution.dailyData?.[dateKey];
          if (resolution === 'skip') {
            delete dailyDataToImport[dateKey];
          } else if (resolution === 'merge') {
            // Merge completed activities and notes
            const existing = conflict.existing;
            const imported = conflict.imported;
            dailyDataToImport[dateKey] = {
              completed: [...new Set([...existing.completed, ...imported.completed])],
              notes: existing.notes + (imported.notes ? `\n\n--- Merged from backup ---\n${imported.notes}` : '')
            };
          }
          // If resolution is 'overwrite', keep the imported data as is
        }
      });
    }

    // Handle settings conflicts
    if (conflicts.settings && conflictResolution.settings === 'skip') {
      settingsToImport = null;
    }

    // Apply the data
    if (activitiesToImport) {
      saveActivities(activitiesToImport);
    }
    
    if (dailyDataToImport) {
      localStorage.setItem(DAILY_DATA_KEY, JSON.stringify(dailyDataToImport));
    }
    
    if (settingsToImport) {
      saveSettings(settingsToImport);
    }
    
    return { success: true, conflicts };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: error.message };
  }
};

// Clear all data
export const clearAllData = () => {
  try {
    localStorage.removeItem(ACTIVITIES_KEY);
    localStorage.removeItem(DAILY_DATA_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// Generate backup filename with timestamp
export const generateBackupFilename = () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `momentum_backup_${dateStr}_${timeStr}.json`;
};