/**
 * Local backup service for JSON file export/import
 * Provides local device backup functionality separate from sync
 */

import { 
  exportData, 
  importData as importDataUtil, 
  validateBackupData, 
  detectConflicts,
  generateBackupFilename 
} from '../utils/storage';

// Local storage keys for backup management
const BACKUP_HISTORY_KEY = 'momentum-backup-history';
const BACKUP_SETTINGS_KEY = 'momentum-backup-settings';
const MAX_BACKUP_HISTORY = 20;

/**
 * Get backup history
 */
function getBackupHistory() {
  try {
    const stored = localStorage.getItem(BACKUP_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Add to backup history
 */
function addToBackupHistory(type, filename, size) {
  try {
    const history = getBackupHistory();
    
    history.unshift({
      type, // 'export' or 'import'
      filename,
      size,
      timestamp: Date.now()
    });
    
    // Keep only recent history
    if (history.length > MAX_BACKUP_HISTORY) {
      history.length = MAX_BACKUP_HISTORY;
    }
    
    localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to update backup history:', error);
  }
}

/**
 * Get backup settings
 */
function getBackupSettings() {
  try {
    const stored = localStorage.getItem(BACKUP_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {
      autoBackup: false,
      backupFrequency: 'weekly', // 'daily', 'weekly', 'monthly'
      lastAutoBackup: null,
      includeJournal: true,
      includeReminders: true
    };
  } catch {
    return {
      autoBackup: false,
      backupFrequency: 'weekly',
      lastAutoBackup: null,
      includeJournal: true,
      includeReminders: true
    };
  }
}

/**
 * Save backup settings
 */
function saveBackupSettings(settings) {
  try {
    localStorage.setItem(BACKUP_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save backup settings:', error);
    return false;
  }
}

/**
 * Export data as JSON file
 * @param {object} options - Export options
 * @returns {Promise<{success: boolean, filename?: string, error?: string}>}
 */
export async function exportBackup(options = {}) {
  try {
    const {
      includeJournal = true,
      includeReminders = true,
      customFilename = null
    } = options;
    
    // Get data to export
    let data = exportData();
    
    // Filter data based on options
    if (!includeJournal) {
      // Remove journal entries from daily data
      const filteredDailyData = {};
      Object.keys(data.dailyData || {}).forEach(date => {
        const dayData = { ...data.dailyData[date] };
        delete dayData.journal;
        filteredDailyData[date] = dayData;
      });
      data.dailyData = filteredDailyData;
    }
    
    if (!includeReminders) {
      delete data.reminders;
    }
    
    // Add backup metadata
    data.backupMetadata = {
      type: 'local_backup',
      version: '1.0.0',
      timestamp: Date.now(),
      options: {
        includeJournal,
        includeReminders
      }
    };
    
    // Generate filename
    const filename = customFilename || generateBackupFilename('momentum_backup');
    
    // Create and download file
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Add to history
    addToBackupHistory('export', filename, blob.size);
    
    return {
      success: true,
      filename,
      size: blob.size
    };
  } catch (error) {
    console.error('Backup export failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to export backup'
    };
  }
}

/**
 * Import data from JSON file
 * @param {File} file - The backup file to import
 * @returns {Promise<{success: boolean, data?: object, conflicts?: object, error?: string}>}
 */
export async function importBackup(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({
        success: false,
        error: 'No file provided'
      });
      return;
    }
    
    if (!file.name.endsWith('.json')) {
      resolve({
        success: false,
        error: 'Invalid file type. Please select a JSON backup file.'
      });
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate backup data
        const validation = validateBackupData(data);
        if (!validation.isValid) {
          resolve({
            success: false,
            error: `Invalid backup file: ${validation.error}`
          });
          return;
        }
        
        // Detect conflicts
        const conflicts = detectConflicts(data);
        
        // Add to history
        addToBackupHistory('import', file.name, file.size);
        
        resolve({
          success: true,
          data,
          conflicts,
          metadata: data.backupMetadata
        });
      } catch (error) {
        resolve({
          success: false,
          error: 'Failed to parse backup file. The file may be corrupted.'
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read backup file'
      });
    };
    
    reader.readAsText(file);
  });
}

/**
 * Apply imported backup data
 * @param {object} data - The backup data to import
 * @param {string} strategy - Import strategy ('merge', 'replace', 'skip')
 * @returns {Promise<boolean>}
 */
export async function applyBackup(data, strategy = 'merge') {
  try {
    // Remove backup metadata before importing
    const dataToImport = { ...data };
    delete dataToImport.backupMetadata;
    
    // Import the data
    const success = importDataUtil(dataToImport, strategy);
    
    if (success) {
      // Update last backup time if this was an import
      const settings = getBackupSettings();
      settings.lastRestore = Date.now();
      saveBackupSettings(settings);
    }
    
    return success;
  } catch (error) {
    console.error('Failed to apply backup:', error);
    throw error;
  }
}

/**
 * Check if auto-backup is due
 */
export function isAutoBackupDue() {
  const settings = getBackupSettings();
  
  if (!settings.autoBackup || !settings.lastAutoBackup) {
    return settings.autoBackup;
  }
  
  const now = Date.now();
  const lastBackup = settings.lastAutoBackup;
  const timeDiff = now - lastBackup;
  
  switch (settings.backupFrequency) {
    case 'daily':
      return timeDiff > 24 * 60 * 60 * 1000; // 24 hours
    case 'weekly':
      return timeDiff > 7 * 24 * 60 * 60 * 1000; // 7 days
    case 'monthly':
      return timeDiff > 30 * 24 * 60 * 60 * 1000; // 30 days
    default:
      return false;
  }
}

/**
 * Perform automatic backup
 */
export async function performAutoBackup() {
  try {
    const settings = getBackupSettings();
    
    if (!settings.autoBackup) {
      return { success: false, error: 'Auto-backup is disabled' };
    }
    
    const result = await exportBackup({
      includeJournal: settings.includeJournal,
      includeReminders: settings.includeReminders,
      customFilename: generateBackupFilename('momentum_auto_backup')
    });
    
    if (result.success) {
      // Update last auto-backup time
      settings.lastAutoBackup = Date.now();
      saveBackupSettings(settings);
    }
    
    return result;
  } catch (error) {
    console.error('Auto-backup failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get backup statistics
 */
export function getBackupStats() {
  const history = getBackupHistory();
  const settings = getBackupSettings();
  
  const exports = history.filter(h => h.type === 'export');
  const imports = history.filter(h => h.type === 'import');
  
  return {
    totalBackups: exports.length,
    totalRestores: imports.length,
    lastBackup: exports[0]?.timestamp || null,
    lastRestore: imports[0]?.timestamp || null,
    autoBackupEnabled: settings.autoBackup,
    nextAutoBackup: getNextAutoBackupTime(),
    totalSize: history.reduce((sum, h) => sum + (h.size || 0), 0)
  };
}

/**
 * Get next auto-backup time
 */
function getNextAutoBackupTime() {
  const settings = getBackupSettings();
  
  if (!settings.autoBackup || !settings.lastAutoBackup) {
    return null;
  }
  
  const lastBackup = settings.lastAutoBackup;
  let interval;
  
  switch (settings.backupFrequency) {
    case 'daily':
      interval = 24 * 60 * 60 * 1000;
      break;
    case 'weekly':
      interval = 7 * 24 * 60 * 60 * 1000;
      break;
    case 'monthly':
      interval = 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      return null;
  }
  
  return lastBackup + interval;
}

/**
 * Clear backup history
 */
export function clearBackupHistory() {
  localStorage.removeItem(BACKUP_HISTORY_KEY);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate backup file before import
 */
export function validateBackupFile(file) {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
  } else {
    if (!file.name.endsWith('.json')) {
      errors.push('File must be a JSON file');
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      errors.push('File size too large (max 50MB)');
    }
    
    if (file.size === 0) {
      errors.push('File is empty');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export settings functions
export {
  getBackupHistory,
  getBackupSettings,
  saveBackupSettings
};