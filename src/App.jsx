import { useState, useEffect } from 'react';
import useStore from './store/useStore';
import Onboarding from './components/Onboarding';
import Today from './components/Today';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import Navigation from './components/Navigation';

function App() {
  const { isOnboarded, initialize } = useStore();
  const [currentTab, setCurrentTab] = useState('today');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initialize();
    setIsInitialized(true);
  }, [initialize]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if not onboarded
  if (!isOnboarded) {
    return <Onboarding />;
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
    <div className="App">
      {renderCurrentTab()}
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
}

export default App;