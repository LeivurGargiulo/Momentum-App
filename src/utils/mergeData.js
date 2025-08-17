/**
 * Data merge utilities for sync conflict resolution
 * Provides intelligent merging strategies for different data types
 */

/**
 * Merge activities arrays
 * @param {Array} local - Local activities
 * @param {Array} remote - Remote activities
 * @param {string} strategy - 'merge', 'replace', or 'local'
 * @returns {Array} Merged activities
 */
export function mergeActivities(local, remote, strategy = 'merge') {
  if (strategy === 'replace') {
    return remote;
  }
  
  if (strategy === 'local') {
    return local;
  }
  
  // Smart merge: combine unique activities
  const mergedMap = new Map();
  
  // Add local activities first
  local.forEach(activity => {
    mergedMap.set(activity.id, activity);
  });
  
  // Add or update with remote activities
  remote.forEach(activity => {
    const existing = mergedMap.get(activity.id);
    if (!existing) {
      // New activity from remote
      mergedMap.set(activity.id, activity);
    } else {
      // Activity exists in both - use the one with latest modification
      // If no modification time, prefer remote (assuming it's newer)
      const localTime = existing.lastModified || 0;
      const remoteTime = activity.lastModified || Date.now();
      
      if (remoteTime >= localTime) {
        mergedMap.set(activity.id, activity);
      }
    }
  });
  
  // Sort by order and return array
  return Array.from(mergedMap.values()).sort((a, b) => {
    return (a.order || 0) - (b.order || 0);
  });
}

/**
 * Merge daily data objects
 * @param {Object} local - Local daily data
 * @param {Object} remote - Remote daily data
 * @param {string} strategy - 'merge', 'replace', or 'local'
 * @returns {Object} Merged daily data
 */
export function mergeDailyData(local, remote, strategy = 'merge') {
  if (strategy === 'replace') {
    return remote;
  }
  
  if (strategy === 'local') {
    return local;
  }
  
  // Smart merge: combine data by date
  const merged = { ...local };
  
  Object.keys(remote).forEach(dateKey => {
    const localDay = local[dateKey];
    const remoteDay = remote[dateKey];
    
    if (!localDay) {
      // No local data for this date, use remote
      merged[dateKey] = remoteDay;
    } else {
      // Both have data for this date - merge intelligently
      merged[dateKey] = mergeDayData(localDay, remoteDay);
    }
  });
  
  return merged;
}

/**
 * Merge data for a single day
 * @param {Object} local - Local day data
 * @param {Object} remote - Remote day data
 * @returns {Object} Merged day data
 */
function mergeDayData(local, remote) {
  // Determine which is newer based on any timestamp or modification
  const localTime = local.lastModified || 0;
  const remoteTime = remote.lastModified || 0;
  
  if (remoteTime > localTime) {
    // Remote is newer, use it as base
    return {
      ...remote,
      // But merge completed activities (union)
      completed: mergeCompletedActivities(local.completed || [], remote.completed || [])
    };
  } else {
    // Local is newer or same, use it as base
    return {
      ...local,
      // But still merge completed activities
      completed: mergeCompletedActivities(local.completed || [], remote.completed || [])
    };
  }
}

/**
 * Merge completed activities arrays (union)
 * @param {Array} local - Local completed activities
 * @param {Array} remote - Remote completed activities
 * @returns {Array} Merged completed activities
 */
function mergeCompletedActivities(local, remote) {
  const merged = new Set([...local, ...remote]);
  return Array.from(merged);
}

/**
 * Merge settings objects
 * @param {Object} local - Local settings
 * @param {Object} remote - Remote settings
 * @param {string} strategy - 'merge', 'replace', or 'local'
 * @returns {Object} Merged settings
 */
export function mergeSettings(local, remote, strategy = 'merge') {
  if (strategy === 'replace') {
    return remote;
  }
  
  if (strategy === 'local') {
    return local;
  }
  
  // Smart merge: use newer values for each setting
  const merged = { ...local };
  
  Object.keys(remote).forEach(key => {
    // For now, just use remote values (assuming they're newer)
    // Could add timestamp tracking per setting for better merging
    merged[key] = remote[key];
  });
  
  return merged;
}

/**
 * Merge reminders arrays
 * @param {Array} local - Local reminders
 * @param {Array} remote - Remote reminders
 * @param {string} strategy - 'merge', 'replace', or 'local'
 * @returns {Array} Merged reminders
 */
export function mergeReminders(local, remote, strategy = 'merge') {
  if (!local) local = [];
  if (!remote) remote = [];
  
  if (strategy === 'replace') {
    return remote;
  }
  
  if (strategy === 'local') {
    return local;
  }
  
  // Smart merge: combine unique reminders
  const mergedMap = new Map();
  
  // Add local reminders
  local.forEach(reminder => {
    const key = `${reminder.time}-${reminder.label}`;
    mergedMap.set(key, reminder);
  });
  
  // Add remote reminders (overwrite if duplicate)
  remote.forEach(reminder => {
    const key = `${reminder.time}-${reminder.label}`;
    mergedMap.set(key, reminder);
  });
  
  return Array.from(mergedMap.values());
}

/**
 * Main merge function
 * @param {Object} localData - Local data object
 * @param {Object} remoteData - Remote data object
 * @param {string} strategy - 'merge', 'replace', or 'local'
 * @returns {Object} Merged data object
 */
export function mergeAllData(localData, remoteData, strategy = 'merge') {
  if (strategy === 'replace') {
    return remoteData;
  }
  
  if (strategy === 'local' || strategy === 'skip') {
    return localData;
  }
  
  // Smart merge each data type
  return {
    activities: mergeActivities(
      localData.activities || [],
      remoteData.activities || [],
      strategy
    ),
    dailyData: mergeDailyData(
      localData.dailyData || {},
      remoteData.dailyData || {},
      strategy
    ),
    settings: mergeSettings(
      localData.settings || {},
      remoteData.settings || {},
      strategy
    ),
    reminders: mergeReminders(
      localData.reminders,
      remoteData.reminders,
      strategy
    ),
    // Preserve other data
    exportDate: remoteData.exportDate || localData.exportDate,
    version: remoteData.version || localData.version
  };
}

/**
 * Calculate what will change in a merge
 * @param {Object} localData - Local data
 * @param {Object} remoteData - Remote data
 * @returns {Object} Summary of changes
 */
export function calculateMergeChanges(localData, remoteData) {
  const changes = {
    activities: {
      added: 0,
      updated: 0,
      unchanged: 0
    },
    dailyData: {
      added: 0,
      updated: 0,
      unchanged: 0
    },
    reminders: {
      added: 0,
      updated: 0,
      unchanged: 0
    }
  };
  
  // Check activities
  const localActivityMap = new Map(
    (localData.activities || []).map(a => [a.id, a])
  );
  
  (remoteData.activities || []).forEach(activity => {
    if (!localActivityMap.has(activity.id)) {
      changes.activities.added++;
    } else {
      const local = localActivityMap.get(activity.id);
      if (JSON.stringify(local) !== JSON.stringify(activity)) {
        changes.activities.updated++;
      } else {
        changes.activities.unchanged++;
      }
    }
  });
  
  // Check daily data
  const localDays = Object.keys(localData.dailyData || {});
  const remoteDays = Object.keys(remoteData.dailyData || {});
  
  remoteDays.forEach(day => {
    if (!localDays.includes(day)) {
      changes.dailyData.added++;
    } else {
      const localDay = localData.dailyData[day];
      const remoteDay = remoteData.dailyData[day];
      if (JSON.stringify(localDay) !== JSON.stringify(remoteDay)) {
        changes.dailyData.updated++;
      } else {
        changes.dailyData.unchanged++;
      }
    }
  });
  
  // Check reminders
  const localReminderKeys = new Set(
    (localData.reminders || []).map(r => `${r.time}-${r.label}`)
  );
  
  (remoteData.reminders || []).forEach(reminder => {
    const key = `${reminder.time}-${reminder.label}`;
    if (!localReminderKeys.has(key)) {
      changes.reminders.added++;
    } else {
      changes.reminders.unchanged++;
    }
  });
  
  return changes;
}