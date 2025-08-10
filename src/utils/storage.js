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

// Export all data as JSON
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
      version: '1.0.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

// Import data from JSON
export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.activities) {
      saveActivities(data.activities);
    }
    
    if (data.dailyData) {
      localStorage.setItem(DAILY_DATA_KEY, JSON.stringify(data.dailyData));
    }
    
    if (data.settings) {
      saveSettings(data.settings);
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
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