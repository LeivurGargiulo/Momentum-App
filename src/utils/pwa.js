// PWA utility functions

// Register service worker
export const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (registrationError) {
      // Service worker registration failed silently
    }
  }
};

// Check for updates
export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content is available - could trigger update notification
        }
      });
    });
  }
};

// Prompt user to refresh when update is available
export const promptForRefresh = () => {
  if (confirm('A new version is available. Would you like to refresh?')) {
    window.location.reload();
  }
};

// Check if app is installed as PWA
export const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

// Check if running on mobile
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Get install prompt criteria
export const canInstallPWA = () => {
  return !isPWAInstalled() && isMobile();
};