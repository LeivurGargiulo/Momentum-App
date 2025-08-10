import { useState, useRef } from 'react';
import { Moon, Sun, Download, Upload, Trash2, Heart, Info, Settings as SettingsIcon } from 'lucide-react';
import useStore from '../store/useStore';
import { exportData, importData, clearAllData } from '../utils/storage';
import { strings } from '../strings';
import ActivityManager from './ActivityManager';

const Settings = () => {
  const { settings, toggleDarkMode, getSortedActivities } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showActivityManager, setShowActivityManager] = useState(false);
  const fileInputRef = useRef(null);

  const sortedActivities = getSortedActivities();

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      const data = exportData();
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `momentum-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success message
        alert(strings.dataExported);
      } else {
        alert('Error exporting data');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data');
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
        const success = importData(e.target.result);
        if (success) {
          alert(strings.dataImported);
          window.location.reload(); // Reload to update the app state
        } else {
          alert('Error importing data');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing data');
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const handleClearData = () => {
    if (window.confirm(strings.confirmClearData)) {
      setIsClearing(true);
      
      try {
        const success = clearAllData();
        if (success) {
          alert(strings.dataCleared);
          window.location.reload(); // Reload to reset the app
        } else {
          alert('Error clearing data');
        }
      } catch (error) {
        console.error('Clear error:', error);
        alert('Error clearing data');
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {strings.settings}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your Momentum experience
          </p>
        </div>

        {/* Activity Management */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Manage Activities
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sortedActivities.length} activities configured
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowActivityManager(true)}
              className="btn-primary px-4 py-2 text-sm"
            >
              Manage
            </button>
          </div>
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
                  {settings.darkMode ? strings.darkMode : strings.lightMode}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Switch between light and dark themes
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

        {/* Data Management */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Data Management
          </h2>
          
          <div className="space-y-4">
            {/* Export Data */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {strings.exportData}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Download your data as JSON
                  </div>
                </div>
              </div>
              {isExporting && (
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Exporting...
                </div>
              )}
            </button>

            {/* Import Data */}
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="w-full flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {strings.importData}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Restore from backup file
                  </div>
                </div>
              </div>
              {isImporting && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  Importing...
                </div>
              )}
            </button>

            {/* Clear Data */}
            <button
              onClick={handleClearData}
              disabled={isClearing}
              className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {strings.clearData}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Delete all your data permanently
                  </div>
                </div>
              </div>
              {isClearing && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  Clearing...
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
              {strings.about}
            </h2>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <p>Momentum helps you build positive habits and track your daily progress. Build momentum, one day at a time.</p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Version 2.0.0
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Heart className="w-3 h-3 text-red-500" />
                <span>Made with love</span>
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
    </div>
  );
};

export default Settings;