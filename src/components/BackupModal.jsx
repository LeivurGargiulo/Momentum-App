import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Download, 
  Upload, 
  Settings as SettingsIcon, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle,
  HardDrive,
  Calendar,
  BarChart3,
  Trash2
} from 'lucide-react';
import {
  exportBackup,
  importBackup,
  applyBackup,
  getBackupStats,
  getBackupHistory,
  getBackupSettings,
  saveBackupSettings,
  formatFileSize,
  validateBackupFile,
  clearBackupHistory
} from '../services/backupService';

const BackupModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('backup'); // 'backup', 'restore', 'settings', 'history'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupStats, setBackupStats] = useState(null);
  const [backupHistory, setBackupHistory] = useState([]);
  const [backupSettings, setBackupSettings] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadBackupData();
    }
  }, [isOpen]);

  const loadBackupData = () => {
    setBackupStats(getBackupStats());
    setBackupHistory(getBackupHistory());
    setBackupSettings(getBackupSettings());
  };

  const handleExportBackup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const options = {
        includeJournal: backupSettings?.includeJournal ?? true,
        includeReminders: backupSettings?.includeReminders ?? true
      };
      
      const result = await exportBackup(options);
      
      if (result.success) {
        setSuccess(t('backup.exportSuccess', { 
          filename: result.filename,
          size: formatFileSize(result.size)
        }));
        loadBackupData(); // Refresh stats
      } else {
        setError(result.error || t('backup.exportError'));
      }
    } catch (err) {
      setError(err.message || t('backup.exportError'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const validation = validateBackupFile(file);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }
    
    setSelectedFile(file);
    setError('');
  };

  const handleImportPreview = async () => {
    if (!selectedFile) {
      setError(t('backup.selectFile'));
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await importBackup(selectedFile);
      
      if (result.success) {
        setImportPreview(result);
        
        // Check for conflicts
        const hasConflicts = 
          result.conflicts.activities.length > 0 ||
          result.conflicts.dailyData.length > 0 ||
          result.conflicts.settings;
        
        if (hasConflicts) {
          setError(t('backup.conflictsDetected'));
        }
      } else {
        setError(result.error || t('backup.importError'));
      }
    } catch (err) {
      setError(err.message || t('backup.importError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyImport = async (strategy = 'merge') => {
    if (!importPreview) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await applyBackup(importPreview.data, strategy);
      setSuccess(t('backup.importSuccess'));
      setSelectedFile(null);
      setImportPreview(null);
      loadBackupData();
      
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message || t('backup.applyError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (key, value) => {
    const newSettings = { ...backupSettings, [key]: value };
    setBackupSettings(newSettings);
    saveBackupSettings(newSettings);
  };

  const handleClearHistory = () => {
    if (confirm(t('backup.confirmClearHistory'))) {
      clearBackupHistory();
      loadBackupData();
      setSuccess(t('backup.historyCleared'));
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('backup.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'backup', icon: Download, label: t('backup.backup') },
            { id: 'restore', icon: Upload, label: t('backup.restore') },
            { id: 'settings', icon: SettingsIcon, label: t('backup.settings') },
            { id: 'history', icon: Clock, label: t('backup.history') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Backup Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="text-center">
                <HardDrive className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('backup.createBackup')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {t('backup.backupDescription')}
                </p>
              </div>

              {/* Stats */}
              {backupStats && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {backupStats.totalBackups}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('backup.totalBackups')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatFileSize(backupStats.totalSize)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('backup.totalSize')}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleExportBackup}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {loading ? t('backup.creating') : t('backup.createBackup')}
              </button>
            </div>
          )}

          {/* Restore Tab */}
          {activeTab === 'restore' && (
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('backup.restoreBackup')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {t('backup.restoreDescription')}
                </p>
              </div>

              {!importPreview ? (
                <>
                  {/* File Selection */}
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {selectedFile ? selectedFile.name : t('backup.selectBackupFile')}
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary"
                      >
                        {t('backup.chooseFile')}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {selectedFile && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {selectedFile.name}
                            </div>
                            <div className="text-xs text-blue-700 dark:text-blue-300">
                              {formatFileSize(selectedFile.size)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleImportPreview}
                      disabled={loading || !selectedFile}
                      className="w-full btn-primary"
                    >
                      {loading ? t('backup.analyzing') : t('backup.analyzeBackup')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Import Preview */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t('backup.backupContents')}
                      </h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('backup.activities')}:</span>
                          <span className="text-gray-900 dark:text-white">
                            {importPreview.data.activities?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('backup.daysTracked')}:</span>
                          <span className="text-gray-900 dark:text-white">
                            {Object.keys(importPreview.data.dailyData || {}).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('backup.reminders')}:</span>
                          <span className="text-gray-900 dark:text-white">
                            {importPreview.data.reminders?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Import Options */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleApplyImport('merge')}
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {loading ? t('backup.restoring') : t('backup.smartMerge')}
                      </button>
                      
                      <button
                        onClick={() => handleApplyImport('replace')}
                        disabled={loading}
                        className="w-full btn-secondary"
                      >
                        {t('backup.replaceAll')}
                      </button>
                      
                      <button
                        onClick={() => {
                          setImportPreview(null);
                          setSelectedFile(null);
                        }}
                        className="w-full btn-secondary"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && backupSettings && (
            <div className="space-y-6">
              <div className="text-center">
                <SettingsIcon className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('backup.backupSettings')}
                </h3>
              </div>

              <div className="space-y-4">
                {/* Include Journal */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {t('backup.includeJournal')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('backup.includeJournalDesc')}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backupSettings.includeJournal}
                      onChange={(e) => handleSettingsChange('includeJournal', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Include Reminders */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {t('backup.includeReminders')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('backup.includeRemindersDesc')}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={backupSettings.includeReminders}
                      onChange={(e) => handleSettingsChange('includeReminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <BarChart3 className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('backup.backupHistory')}
                  </h3>
                </div>
                {backupHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="btn-secondary text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {backupHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('backup.noHistory')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {backupHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      {item.type === 'export' ? (
                        <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.filename}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(item.timestamp)} • {formatFileSize(item.size || 0)}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        {t(`backup.${item.type}`)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{success}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupModal;