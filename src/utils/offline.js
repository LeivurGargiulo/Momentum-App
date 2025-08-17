// Offline functionality utilities

/**
 * Check if the app is currently online
 * @returns {boolean}
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Check if the app is currently offline
 * @returns {boolean}
 */
export const isOffline = () => {
  return !navigator.onLine;
};

/**
 * Queue for operations that need to be performed when online
 */
class OfflineQueue {
  constructor() {
    this.queue = this.loadQueue();
    this.isProcessing = false;
    
    // Listen for online events to process queue
    window.addEventListener('online', () => {
      this.processQueue();
    });
  }

  /**
   * Load queue from localStorage
   */
  loadQueue() {
    try {
      const stored = localStorage.getItem('momentum-offline-queue');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading offline queue:', error);
      return [];
    }
  }

  /**
   * Save queue to localStorage
   */
  saveQueue() {
    try {
      localStorage.setItem('momentum-offline-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  /**
   * Add an operation to the queue
   * @param {Object} operation - The operation to queue
   */
  addToQueue(operation) {
    const queueItem = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      operation,
      retries: 0,
      maxRetries: 3
    };
    
    this.queue.push(queueItem);
    this.saveQueue();
    
    // Try to process immediately if online
    if (isOnline()) {
      this.processQueue();
    }
  }

  /**
   * Process all operations in the queue
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || isOffline()) {
      return;
    }

    this.isProcessing = true;
    const itemsToProcess = [...this.queue];
    
    for (const item of itemsToProcess) {
      try {
        await this.processQueueItem(item);
        // Remove successful item from queue
        this.queue = this.queue.filter(q => q.id !== item.id);
      } catch (error) {
        console.error('Failed to process queue item:', error);
        // Increment retry count
        const queueItem = this.queue.find(q => q.id === item.id);
        if (queueItem) {
          queueItem.retries++;
          if (queueItem.retries >= queueItem.maxRetries) {
            // Remove item if max retries exceeded
            this.queue = this.queue.filter(q => q.id !== item.id);
            console.error('Max retries exceeded for queue item:', queueItem);
          }
        }
      }
    }
    
    this.saveQueue();
    this.isProcessing = false;
  }

  /**
   * Process a single queue item
   * @param {Object} item - Queue item to process
   */
  async processQueueItem(item) {
    const { operation } = item;
    
    switch (operation.type) {
      case 'sync':
        // Handle sync operations when back online
        if (operation.method === 'export') {
          // Could trigger automatic sync export
        }
        break;
      
      case 'analytics':
        // Handle analytics events that were queued
        break;
        
      default:
        console.warn('Unknown queue operation type:', operation.type);
    }
  }

  /**
   * Clear the entire queue
   */
  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      length: this.queue.length,
      isProcessing: this.isProcessing,
      oldestItem: this.queue.length > 0 ? this.queue[0].timestamp : null
    };
  }
}

// Create singleton instance
export const offlineQueue = new OfflineQueue();

/**
 * Execute an operation immediately if online, otherwise queue it
 * @param {Object} operation - Operation to execute or queue
 * @param {Function} onlineCallback - Function to call when online
 */
export const executeOrQueue = async (operation, onlineCallback) => {
  if (isOnline()) {
    try {
      return await onlineCallback();
    } catch (error) {
      // If online operation fails, queue it for later
      offlineQueue.addToQueue(operation);
      throw error;
    }
  } else {
    // Queue for later execution
    offlineQueue.addToQueue(operation);
    throw new Error('Operation queued for when online');
  }
};

/**
 * Check if the app has been used offline
 */
export const hasOfflineUsage = () => {
  return localStorage.getItem('momentum-used-offline') === 'true';
};

/**
 * Mark that the app has been used offline
 */
export const markOfflineUsage = () => {
  localStorage.setItem('momentum-used-offline', 'true');
};

/**
 * Check if local data is newer than last sync
 */
export const hasUnsyncedChanges = () => {
  const lastSync = localStorage.getItem('momentum-last-sync');
  const lastDataChange = localStorage.getItem('momentum-last-data-change');
  
  if (!lastSync) return hasOfflineUsage();
  if (!lastDataChange) return false;
  
  return new Date(lastDataChange) > new Date(lastSync);
};

/**
 * Update last data change timestamp
 */
export const updateLastDataChange = () => {
  localStorage.setItem('momentum-last-data-change', new Date().toISOString());
};

/**
 * Update last sync timestamp
 */
export const updateLastSync = () => {
  localStorage.setItem('momentum-last-sync', new Date().toISOString());
};

/**
 * Get offline capabilities status
 */
export const getOfflineCapabilities = () => {
  return {
    dataStorage: true, // All data stored in localStorage
    fullFunctionality: true, // All core features work offline
    sync: hasUnsyncedChanges(), // Indicates if sync is needed
    queueStatus: offlineQueue.getQueueStatus()
  };
};

/**
 * Show user-friendly message about offline capabilities
 */
export const getOfflineStatusMessage = (t) => {
  if (isOnline()) {
    const hasUnsynced = hasUnsyncedChanges();
    return hasUnsynced 
      ? t('pwa.dataStoredLocally')
      : t('pwa.fullyFunctional');
  } else {
    return t('pwa.fullyFunctional');
  }
};