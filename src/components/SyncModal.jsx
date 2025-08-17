import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Clock,
  Smartphone,
  Monitor,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  exportForSync,
  importFromSync,
  applyImportedData,
  getSyncStatus,
  formatSyncCode
} from '../services/syncService';

const SyncModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'receive'
  const [syncCode, setSyncCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [mergeStrategy, setMergeStrategy] = useState('merge');

  useEffect(() => {
    if (isOpen) {
      loadSyncStatus();
    }
  }, [isOpen]);

  const loadSyncStatus = () => {
    const status = getSyncStatus();
    setSyncStatus(status);
  };

  const handleGenerateSyncCode = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setSyncCode('');
    
    try {
      const result = await exportForSync();
      setSyncCode(result.syncCode);
      setSuccess(t('sync.exportSuccess'));
      loadSyncStatus();
    } catch (err) {
      setError(err.message || t('sync.exportError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(t('sync.copyError'));
    }
  };

  const handleImportPreview = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setImportPreview(null);
    
    const codeToImport = inputCode.trim();
    
    if (!codeToImport) {
      setError(t('sync.enterCode'));
      setLoading(false);
      return;
    }
    
    try {
      const result = await importFromSync(codeToImport);
      setImportPreview(result);
      
      // Check if there are conflicts
      const hasConflicts = 
        result.conflicts.activities.length > 0 ||
        result.conflicts.dailyData.length > 0 ||
        result.conflicts.settings;
      
      if (hasConflicts) {
        setError(t('sync.conflictsDetected'));
      }
    } catch (err) {
      setError(err.message || t('sync.importError'));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyImport = async () => {
    if (!importPreview) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await applyImportedData(importPreview.data, mergeStrategy);
      setSuccess(t('sync.importSuccess'));
      setInputCode('');
      setImportPreview(null);
      loadSyncStatus();
      
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message || t('sync.applyError'));
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputCode(text.trim());
    } catch (err) {
      setError(t('sync.pasteError'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('sync.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'send'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            {t('sync.sendToDevice')}
          </button>
          <button
            onClick={() => setActiveTab('receive')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'receive'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Download className="w-4 h-4" />
            {t('sync.receiveFromDevice')}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Rate Limit Warning */}
          {syncStatus && syncStatus.rateLimit.remaining < 10 && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {t('sync.rateLimitWarning', { remaining: syncStatus.rateLimit.remaining })}
                </span>
              </div>
            </div>
          )}

          {/* Send Tab */}
          {activeTab === 'send' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('sync.sendDescription')}
              </p>

              {!syncCode ? (
                <button
                  onClick={handleGenerateSyncCode}
                  disabled={loading || (syncStatus && !syncStatus.canSync)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('sync.generating')}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {t('sync.generateCode')}
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Sync Code Display */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {t('sync.yourSyncCode')}
                      </p>
                      <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-3">
                        {formatSyncCode(syncCode)}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="btn-secondary flex items-center justify-center gap-2 mx-auto"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            {t('sync.copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            {t('sync.copyCode')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expiry Notice */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{t('sync.expiresIn48Hours')}</span>
                  </div>

                  {/* Instructions */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {t('sync.sendInstructions')}
                      </p>
                    </div>
                  </div>

                  {/* Generate New Button */}
                  <button
                    onClick={handleGenerateSyncCode}
                    className="w-full btn-secondary"
                  >
                    {t('sync.generateNew')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Receive Tab */}
          {activeTab === 'receive' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('sync.receiveDescription')}
              </p>

              {!importPreview ? (
                <>
                  {/* Code Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('sync.enterSyncCode')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="XXXX-XXXX"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-center text-lg"
                        maxLength="9"
                      />
                      <button
                        onClick={handlePaste}
                        className="btn-secondary px-3"
                        title={t('sync.paste')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleImportPreview}
                    disabled={loading || !inputCode.trim()}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {t('sync.retrieving')}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {t('sync.retrieveData')}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Import Preview */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {t('sync.dataPreview')}
                      </h3>
                      
                      {/* Source Device */}
                      {importPreview.metadata && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {importPreview.metadata.deviceInfo?.includes('Mobile') ? (
                            <Smartphone className="w-4 h-4" />
                          ) : (
                            <Monitor className="w-4 h-4" />
                          )}
                          <span>{importPreview.metadata.deviceInfo}</span>
                        </div>
                      )}

                      {/* Data Summary */}
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('sync.activities')}:</span>
                          <span className="text-gray-900 dark:text-white">
                            {importPreview.data.activities?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('sync.daysTracked')}:</span>
                          <span className="text-gray-900 dark:text-white">
                            {Object.keys(importPreview.data.dailyData || {}).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t('sync.reminders')}:</span>
                          <span className="text-gray-900 dark:text-white">
                            {importPreview.data.reminders?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Merge Strategy */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('sync.mergeStrategy')}
                      </label>
                      <select
                        value={mergeStrategy}
                        onChange={(e) => setMergeStrategy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="merge">{t('sync.merge')}</option>
                        <option value="replace">{t('sync.replace')}</option>
                        <option value="skip">{t('sync.skip')}</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t(`sync.${mergeStrategy}Description`)}
                      </p>
                    </div>

                    {/* Conflict Warning */}
                    {(importPreview.conflicts.activities.length > 0 ||
                      importPreview.conflicts.dailyData.length > 0) && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                          <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <p className="font-medium">{t('sync.conflictsFound')}</p>
                            <ul className="mt-1 space-y-0.5">
                              {importPreview.conflicts.activities.length > 0 && (
                                <li>• {importPreview.conflicts.activities.length} {t('sync.activityConflicts')}</li>
                              )}
                              {importPreview.conflicts.dailyData.length > 0 && (
                                <li>• {importPreview.conflicts.dailyData.length} {t('sync.dayConflicts')}</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setImportPreview(null);
                          setInputCode('');
                        }}
                        className="flex-1 btn-secondary"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={handleApplyImport}
                        disabled={loading}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            {t('sync.importing')}
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            {t('sync.import')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
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
                <Check className="w-4 h-4" />
                <span className="text-sm">{success}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('sync.privacyNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SyncModal;