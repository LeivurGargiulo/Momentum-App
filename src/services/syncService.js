/**
 * Main sync service
 * Orchestrates data export/import, encryption, and Gist operations
 */

import { 
  encryptData, 
  decryptData, 
  generateSyncCode, 
  validateSyncCode,
  normalizeSyncCode,
  calculateChecksum 
} from '../utils/encryption';
import { 
  createGist, 
  getGist,
  getRateLimitStatus 
} from './gistService';
import { 
  exportData,
  importData,
  detectConflicts 
} from '../utils/storage';

// Store sync code to Gist ID mappings in localStorage
const SYNC_MAPPING_KEY = 'momentum-sync-mappings';
const SYNC_HISTORY_KEY = 'momentum-sync-history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Get stored sync mappings
 */
function getSyncMappings() {
  try {
    const stored = localStorage.getItem(SYNC_MAPPING_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save sync mapping
 */
function saveSyncMapping(syncCode, gistId) {
  const mappings = getSyncMappings();
  mappings[normalizeSyncCode(syncCode)] = {
    gistId,
    createdAt: Date.now(),
    expiresAt: Date.now() + (48 * 60 * 60 * 1000) // 48 hours
  };
  
  // Clean up expired mappings
  const now = Date.now();
  Object.keys(mappings).forEach(code => {
    if (mappings[code].expiresAt < now) {
      delete mappings[code];
    }
  });
  
  localStorage.setItem(SYNC_MAPPING_KEY, JSON.stringify(mappings));
}

/**
 * Get Gist ID from sync code
 */
function getGistIdFromSyncCode(syncCode) {
  const mappings = getSyncMappings();
  const normalized = normalizeSyncCode(syncCode);
  const mapping = mappings[normalized];
  
  if (!mapping) {
    throw new Error('Invalid or expired sync code');
  }
  
  if (mapping.expiresAt < Date.now()) {
    throw new Error('This sync code has expired');
  }
  
  return mapping.gistId;
}

/**
 * Add to sync history
 */
function addToSyncHistory(type, syncCode, deviceInfo) {
  try {
    const stored = localStorage.getItem(SYNC_HISTORY_KEY);
    const history = stored ? JSON.parse(stored) : [];
    
    history.unshift({
      type, // 'export' or 'import'
      syncCode: type === 'export' ? syncCode : null,
      timestamp: Date.now(),
      deviceInfo: deviceInfo || getDeviceInfo()
    });
    
    // Keep only recent history
    if (history.length > MAX_HISTORY_ITEMS) {
      history.length = MAX_HISTORY_ITEMS;
    }
    
    localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to update sync history:', error);
  }
}

/**
 * Get device info for sync metadata
 */
function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  let device = 'Unknown Device';
  
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    device = 'iOS Device';
  } else if (/Android/.test(userAgent)) {
    device = 'Android Device';
  } else if (/Windows/.test(userAgent)) {
    device = 'Windows PC';
  } else if (/Mac/.test(userAgent)) {
    device = 'Mac';
  } else if (/Linux/.test(userAgent)) {
    device = 'Linux PC';
  }
  
  let browser = 'Unknown Browser';
  if (/Chrome/.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
    browser = 'Safari';
  } else if (/Firefox/.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Edge/.test(userAgent)) {
    browser = 'Edge';
  }
  
  return `${device} - ${browser}`;
}

/**
 * Export data and create sync code
 * @returns {Promise<{syncCode: string, expiresAt: Date}>}
 */
export async function exportForSync() {
  try {
    // Get current data
    const data = exportData();
    
    // Add sync metadata
    const syncData = {
      ...data,
      syncMetadata: {
        deviceInfo: getDeviceInfo(),
        exportedAt: Date.now(),
        checksum: await calculateChecksum(data)
      }
    };
    
    // Generate sync code
    const syncCode = generateSyncCode();
    
    // Encrypt data
    const encryptedData = await encryptData(syncData, syncCode);
    
    // Create Gist
    const gistInfo = await createGist(encryptedData);
    
    // Save mapping
    saveSyncMapping(syncCode, gistInfo.id);
    
    // Add to history
    addToSyncHistory('export', syncCode);
    
    return {
      syncCode,
      gistId: gistInfo.id,
      expiresAt: new Date(Date.now() + (48 * 60 * 60 * 1000)),
      url: gistInfo.url
    };
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to create sync code: ${error.message}`);
  }
}

/**
 * Import data from sync code
 * @param {string} syncCode - The sync code to import from
 * @returns {Promise<{data: object, conflicts: object}>}
 */
export async function importFromSync(syncCode) {
  try {
    // Validate sync code format
    if (!validateSyncCode(syncCode)) {
      throw new Error('Invalid sync code format');
    }
    
    // Get Gist ID from sync code
    const gistId = getGistIdFromSyncCode(syncCode);
    
    // Retrieve encrypted data from Gist
    const encryptedData = await getGist(gistId);
    
    // Decrypt data
    const decryptedData = await decryptData(encryptedData, normalizeSyncCode(syncCode));
    
    // Verify checksum
    if (decryptedData.syncMetadata && decryptedData.syncMetadata.checksum) {
      const dataWithoutMetadata = { ...decryptedData };
      delete dataWithoutMetadata.syncMetadata;
      const calculatedChecksum = await calculateChecksum(dataWithoutMetadata);
      
      if (calculatedChecksum !== decryptedData.syncMetadata.checksum) {
        console.warn('Checksum mismatch - data may be corrupted');
      }
    }
    
    // Detect conflicts with existing data
    const conflicts = detectConflicts(decryptedData);
    
    // Add to history
    addToSyncHistory('import', null, decryptedData.syncMetadata?.deviceInfo);
    
    return {
      data: decryptedData,
      conflicts,
      metadata: decryptedData.syncMetadata
    };
  } catch (error) {
    console.error('Import failed:', error);
    throw new Error(`Failed to import from sync code: ${error.message}`);
  }
}

/**
 * Apply imported data with merge strategy
 * @param {object} importedData - The data to import
 * @param {string} strategy - 'replace', 'merge', or 'skip'
 * @returns {boolean} Success status
 */
export async function applyImportedData(importedData, strategy = 'merge') {
  try {
    // Remove sync metadata before importing
    const dataToImport = { ...importedData };
    delete dataToImport.syncMetadata;
    
    // Apply based on strategy
    switch (strategy) {
      case 'replace':
        // Complete replacement
        return importData(dataToImport);
        
      case 'merge':
        // Smart merge (handled by importData with conflict resolution)
        return importData(dataToImport);
        
      case 'skip':
        // Don't import anything
        return true;
        
      default:
        throw new Error('Invalid merge strategy');
    }
  } catch (error) {
    console.error('Failed to apply imported data:', error);
    throw error;
  }
}

/**
 * Get sync history
 * @returns {Array} Sync history items
 */
export function getSyncHistory() {
  try {
    const stored = localStorage.getItem(SYNC_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear sync history
 */
export function clearSyncHistory() {
  localStorage.removeItem(SYNC_HISTORY_KEY);
  localStorage.removeItem(SYNC_MAPPING_KEY);
}

/**
 * Get sync status including rate limits
 * @returns {object} Sync status info
 */
export function getSyncStatus() {
  const rateLimit = getRateLimitStatus();
  const history = getSyncHistory();
  const lastSync = history[0];
  
  return {
    rateLimit,
    lastSync: lastSync ? {
      type: lastSync.type,
      timestamp: lastSync.timestamp,
      deviceInfo: lastSync.deviceInfo
    } : null,
    canSync: !rateLimit.isLimited
  };
}

/**
 * Check if a sync code exists and is valid
 * @param {string} syncCode - The sync code to check
 * @returns {boolean} True if valid and not expired
 */
export function isSyncCodeValid(syncCode) {
  try {
    if (!validateSyncCode(syncCode)) {
      return false;
    }
    
    const mappings = getSyncMappings();
    const normalized = normalizeSyncCode(syncCode);
    const mapping = mappings[normalized];
    
    return mapping && mapping.expiresAt > Date.now();
  } catch {
    return false;
  }
}

/**
 * Format sync code for display
 * @param {string} syncCode - The sync code
 * @returns {string} Formatted sync code
 */
export function formatSyncCode(syncCode) {
  const normalized = normalizeSyncCode(syncCode);
  if (normalized.length === 8) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4)}`;
  }
  return normalized;
}

// Export for testing
export const _internal = {
  getSyncMappings,
  saveSyncMapping,
  getGistIdFromSyncCode,
  addToSyncHistory,
  getDeviceInfo
};