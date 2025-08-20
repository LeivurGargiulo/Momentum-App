import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from './store/useStore';
import { initializeReminders } from './utils/reminders';
import Onboarding from './components/Onboarding';
import Today from './components/Today';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import Calendar from './components/Calendar';
import Navigation from './components/Navigation';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import UpdateNotification from './components/UpdateNotification';

function App() {
  const { t } = useTranslation();
  const { isOnboarded, initialize, currentDate, setCurrentDate } = useStore();
  const [currentTab, setCurrentTab] = useState('today');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initialize();
    setIsInitialized(true);
    
    // Initialize reminders system
    initializeReminders(t);
    
    // Save data when the app is about to close or navigate away
    const handleBeforeUnload = () => {
      const store = useStore.getState();
      const currentDateKey = new Date(store.currentDate).toISOString().split('T')[0];
      const currentData = store.dailyData[currentDateKey];
      
      if (currentData) {
        // Save current day's data to localStorage
        localStorage.setItem(`momentum-daily-${currentDateKey}`, JSON.stringify(currentData));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [initialize, t]);

  // Check for day change every minute
  useEffect(() => {
    const checkDayChange = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      
      // If the day has changed, update to the new day
      if (today.getTime() !== currentDay.getTime()) {
        setCurrentDate(now);
      }
    };

    // Check immediately
    checkDayChange();
    
    // Check every minute
    const interval = setInterval(checkDayChange, 60000);
    
    return () => clearInterval(interval);
  }, [currentDate, setCurrentDate]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pwa-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show onboarding if not onboarded
  if (!isOnboarded) {
    return (
      <div className="pwa-container">
        <Onboarding />
        <PWAInstallPrompt />
        <OfflineIndicator />
        <UpdateNotification />
      </div>
    );
  }

  // Render main app with navigation
  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'today':
        return <Today />;
      case 'calendar':
        return <Calendar />;
      case 'stats':
        return <Statistics />;
      case 'settings':
        return <Settings />;
      default:
        return <Today />;
    }
  };

  return (
    <div className="App pwa-container">
      <div className="pwa-content">
        {renderCurrentTab()}
      </div>
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
      <PWAInstallPrompt />
      <OfflineIndicator />
      <UpdateNotification />
    </div>
  );
}

export default App;