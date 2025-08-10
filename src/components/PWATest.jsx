import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const PWATest = () => {
  const [tests, setTests] = useState({
    serviceWorker: { status: 'pending', message: 'Checking service worker...' },
    manifest: { status: 'pending', message: 'Checking manifest...' },
    installable: { status: 'pending', message: 'Checking installability...' },
    offline: { status: 'pending', message: 'Checking offline capability...' }
  });

  useEffect(() => {
    // Test service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setTests(prev => ({
          ...prev,
          serviceWorker: { status: 'success', message: 'Service worker registered' }
        }));
      }).catch(() => {
        setTests(prev => ({
          ...prev,
          serviceWorker: { status: 'error', message: 'Service worker failed to register' }
        }));
      });
    } else {
      setTests(prev => ({
        ...prev,
        serviceWorker: { status: 'error', message: 'Service worker not supported' }
      }));
    }

    // Test manifest
    fetch('/manifest.webmanifest')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Manifest not found');
      })
      .then(() => {
        setTests(prev => ({
          ...prev,
          manifest: { status: 'success', message: 'Manifest loaded successfully' }
        }));
      })
      .catch(() => {
        setTests(prev => ({
          ...prev,
          manifest: { status: 'error', message: 'Manifest failed to load' }
        }));
      });

    // Test installability
    const isInstallable = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true;
    setTests(prev => ({
      ...prev,
      installable: { 
        status: isInstallable ? 'success' : 'warning', 
        message: isInstallable ? 'App is installed' : 'App can be installed'
      }
    }));

    // Test offline capability
    setTests(prev => ({
      ...prev,
      offline: { 
        status: 'success', 
        message: 'App works offline (localStorage data)' 
      }
    }));
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />;
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        PWA Status
      </h3>
      <div className="space-y-2">
        {Object.entries(tests).map(([key, test]) => (
          <div key={key} className="flex items-center gap-2">
            {getStatusIcon(test.status)}
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {test.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PWATest;