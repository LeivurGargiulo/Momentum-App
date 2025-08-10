import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(true);
      });
    }
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-600 text-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw size={16} className="animate-spin" />
          <div>
            <h3 className="text-sm font-semibold">Update Available</h3>
            <p className="text-xs opacity-90">A new version is ready to install</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1 rounded transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handleDismiss}
            className="text-white opacity-70 hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;