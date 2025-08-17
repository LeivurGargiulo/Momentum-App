import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff, Check } from 'lucide-react';

const OfflineIndicator = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnectedMessage, setShowReconnectedMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      const wasOffline = !isOnline;
      setIsOnline(true);
      
      // Show reconnected message if we were offline
      if (wasOffline) {
        setShowReconnectedMessage(true);
        setTimeout(() => setShowReconnectedMessage(false), 3000);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedMessage(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  // Show reconnected message
  if (showReconnectedMessage) {
    return (
      <div className="fixed top-4 right-4 z-40 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg animate-pulse">
        <Check size={12} />
        {t('pwa.backOnline')}
      </div>
    );
  }

  // Show offline indicator
  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-40 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
        <WifiOff size={12} />
        <span>{t('pwa.offline')}</span>
        <div className="ml-1 text-xs opacity-75">
          {t('pwa.offlineMode')}
        </div>
      </div>
    );
  }

  return null;
};

export default OfflineIndicator;