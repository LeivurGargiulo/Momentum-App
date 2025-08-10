import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-40 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
      <WifiOff size={12} />
      {t('pwa.offline')}
    </div>
  );
};

export default OfflineIndicator;