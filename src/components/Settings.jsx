import { useState, useRef } from 'react';
import { Moon, Sun, Download, Upload, Trash2, Heart, Info, Settings as SettingsIcon, AlertCircle, CheckCircle, Bell, RefreshCw, HardDrive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';
import { exportData, importData as importDataUtil, clearAllData, generateBackupFilename, validateBackupData, detectConflicts } from '../utils/storage';
import ActivityManager from './ActivityManager';
import LanguageSwitcher from './LanguageSwitcher';
import ImportConflictResolver from './ImportConflictResolver';
import Reminders from './Reminders';
import SyncModal from './SyncModal';
import BackupModal from './BackupModal';

const Settings = () => {
  const { t } = useTranslation();
  const { settings, toggleDarkMode, getSortedActivities, initialize } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showActivityManager, setShowActivityManager] = useState(false);
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [importConflicts, setImportConflicts] = useState(null);
  const [importData, setImportData] = useState(null);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  const sortedActivities = getSortedActivities();

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      const data = exportData();
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = generateBackupFilename();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('success', t('messages.dataExported'));
      } else {
        showNotification('error', t('errors.errorExportingData'));
      }
    } catch (error) {
      console.error('Export error:', error);
      showNotification('error', t('errors.errorExportingData'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Validate the file content
        const validation = validateBackupData(JSON.parse(e.target.result));
        if (!validation.isValid) {
          showNotification('error', t('errors.invalidBackupFile', { error: validation.error }));
          setIsImporting(false);
          return;
        }

        const data = JSON.parse(e.target.result);
        
        // Check for conflicts
        const conflicts = detectConflicts(data);
        const hasConflicts = conflicts.activities.length > 0 || conflicts.dailyData.length > 0 || conflicts.settings;

        if (hasConflicts) {
          // Show conflict resolver
          setImportData(data);
          setImportConflicts(conflicts);
          setShowConflictResolver(true);
        } else {
          // No conflicts, import directly
          performImport(data);
        }
      } catch (error) {
        console.error('Import error:', error);
        showNotification('error', t('errors.errorImportingData'));
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      showNotification('error', t('errors.errorReadingFile'));
      setIsImporting(false);
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const performImport = (data, conflictResolution = {}) => {
    setIsImporting(true);
    
    try {
      const result = importDataUtil(JSON.stringify(data), conflictResolution);
      
      if (result.success) {
        // Reinitialize the store to load the new data
        initialize();
        showNotification('success', t('messages.dataImported'));
      } else {
        showNotification('error', t('errors.errorImportingData'));
      }
    } catch (error) {
      console.error('Import error:', error);
      showNotification('error', t('errors.errorImportingData'));
    } finally {
      setIsImporting(false);
      setShowConflictResolver(false);
      setImportData(null);
      setImportConflicts(null);
    }
  };

  const handleConflictResolution = async (resolutions) => {
    await performImport(importData, resolutions);
  };

  const handleClearData = () => {
    if (window.confirm(t('messages.confirmClearData'))) {
      setIsClearing(true);
      
      try {
        const success = clearAllData();
        if (success) {
          showNotification('success', t('messages.dataCleared'));
          // Reinitialize the store
          initialize();
        } else {
          showNotification('error', t('errors.errorClearingData'));
        }
      } catch (error) {
        console.error('Clear error:', error);
        showNotification('error', t('errors.errorClearingData'));
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
          notification.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            : 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Activity Management */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('settings.manageActivities')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sortedActivities.length} {t('settings.activitiesConfigured')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowActivityManager(true)}
              className="btn-primary px-4 py-2 text-sm"
            >
              {t('settings.manage')}
            </button>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="card p-6 mb-6">
          <LanguageSwitcher />
        </div>

        {/* Dark Mode Toggle */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <Sun className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {settings.darkMode ? t('settings.darkMode') : t('settings.lightMode')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.switchTheme')}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{
                backgroundColor: settings.darkMode ? '#3B82F6' : '#D1D5DB'
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reminders Management */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('settings.reminders')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.remindersDescription')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowReminders(true)}
              className="btn-primary px-4 py-2 text-sm"
            >
              {t('settings.manage')}
            </button>
          </div>
        </div>

        {/* Sync Between Devices */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('sync.title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('sync.description')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSyncModal(true)}
              className="btn-primary px-4 py-2 text-sm"
            >
              {t('sync.syncDevices')}
            </button>
          </div>
        </div>

        {/* Local Backups */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <HardDrive className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('backup.title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('backup.description')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBackupModal(true)}
              className="btn-primary px-4 py-2 text-sm"
            >
              {t('backup.manage')}
            </button>
          </div>
        </div>


        {/* Data Management */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('settings.dataManagement')}
          </h2>
          
          <div className="space-y-4">
            {/* Export Data */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {t('settings.exportData')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('settings.downloadData')}
                  </div>
                </div>
              </div>
              {isExporting && (
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {t('settings.exporting')}
                </div>
              )}
            </button>

            {/* Import Data */}
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {t('settings.importData')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('settings.restoreBackup')}
                  </div>
                </div>
              </div>
              {isImporting && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  {t('settings.importing')}
                </div>
              )}
            </button>

            {/* Clear Data */}
            <button
              onClick={handleClearData}
              disabled={isClearing}
              className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {t('settings.clearData')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('settings.deletePermanently')}
                  </div>
                </div>
              </div>
              {isClearing && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {t('settings.clearing')}
                </div>
              )}
            </button>
          </div>

          {/* Hidden file input for import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* About Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('settings.about')}
            </h2>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>{t('about.appDescription')}</p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.version')}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Heart className="w-3 h-3 text-red-500" />
                <span>{t('about.madeWith')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Manager Modal */}
      <ActivityManager 
        isOpen={showActivityManager} 
        onClose={() => setShowActivityManager(false)} 
      />

      {/* Import Conflict Resolver Modal */}
      {showConflictResolver && importConflicts && (
        <ImportConflictResolver
          conflicts={importConflicts}
          onResolve={handleConflictResolution}
          onCancel={() => {
            setShowConflictResolver(false);
            setImportData(null);
            setImportConflicts(null);
          }}
        />
      )}

      {/* Reminders Modal */}
      <Reminders 
        isOpen={showReminders} 
        onClose={() => setShowReminders(false)} 
      />

      {/* Sync Modal */}
      <SyncModal 
        isOpen={showSyncModal} 
        onClose={() => setShowSyncModal(false)} 
      />

      {/* Backup Modal */}
      <BackupModal 
        isOpen={showBackupModal} 
        onClose={() => setShowBackupModal(false)} 
      />

    </div>
  );
};

export default Settings;