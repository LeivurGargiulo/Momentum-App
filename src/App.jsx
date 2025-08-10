import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from './store/useStore';
import { initializeReminders } from './utils/reminders';
import Onboarding from './components/Onboarding';
import Today from './components/Today';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import Navigation from './components/Navigation';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import UpdateNotification from './components/UpdateNotification';
import PWATest from './components/PWATest';

function App() {
  const { t } = useTranslation();
  const { isOnboarded, initialize } = useStore();
  const [currentTab, setCurrentTab] = useState('today');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initialize();
    setIsInitialized(true);
    
    // Initialize reminders system
    initializeReminders();
  }, [initialize]);

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
        {import.meta.env.DEV && <PWATest />}
      </div>
    );
  }

  // Render main app with navigation
  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'today':
        return <Today />;
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
      {import.meta.env.DEV && <PWATest />}
    </div>
  );
}

export default App;