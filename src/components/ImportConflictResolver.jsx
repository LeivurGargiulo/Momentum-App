import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Merge, Download, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ImportConflictResolver = ({ conflicts, onResolve, onCancel }) => {
  const { t } = useTranslation();
  const [resolutions, setResolutions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResolutionChange = (type, id, resolution) => {
    setResolutions(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: resolution
      }
    }));
  };

  const handleApplyResolutions = async () => {
    setIsProcessing(true);
    try {
      await onResolve(resolutions);
    } finally {
      setIsProcessing(false);
    }
  };

  const getConflictCount = () => {
    let count = 0;
    if (conflicts.activities.length > 0) count += conflicts.activities.length;
    if (conflicts.dailyData.length > 0) count += conflicts.dailyData.length;
    if (conflicts.settings) count += 1;
    return count;
  };

  const renderActivityConflict = (conflict, index) => {
    const { imported, existing, type } = conflict;
    const resolution = resolutions.activities?.[imported.id] || 'skip';

    return (
      <div key={`activity-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              {type === 'id' ? t('import.conflictSameId') : t('import.conflictSameName')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('import.activityConflictDescription')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Existing Activity */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('import.existing')}
              </span>
            </div>
            <p className="text-sm text-gray-900 dark:text-white">{existing.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ID: {existing.id}
            </p>
          </div>

          {/* Imported Activity */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('import.imported')}
              </span>
            </div>
            <p className="text-sm text-gray-900 dark:text-white">{imported.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ID: {imported.id}
            </p>
          </div>
        </div>

        {/* Resolution Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`activity-${imported.id}`}
              value="skip"
              checked={resolution === 'skip'}
              onChange={(e) => handleResolutionChange('activities', imported.id, e.target.value)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('import.skipImported')}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`activity-${imported.id}`}
              value="overwrite"
              checked={resolution === 'overwrite'}
              onChange={(e) => handleResolutionChange('activities', imported.id, e.target.value)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('import.overwriteExisting')}
            </span>
          </label>
        </div>
      </div>
    );
  };

  const renderDailyDataConflict = (conflict, index) => {
    const { dateKey, imported, existing } = conflict;
    const resolution = resolutions.dailyData?.[dateKey] || 'skip';

    return (
      <div key={`daily-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              {t('import.conflictSameDate')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('import.dailyDataConflictDescription', { date: dateKey })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Existing Data */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('import.existing')}
              </span>
            </div>
            <p className="text-sm text-gray-900 dark:text-white">
              {t('import.completedActivities', { count: existing.completed.length })}
            </p>
            {existing.notes && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('import.hasNotes')}
              </p>
            )}
          </div>

          {/* Imported Data */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('import.imported')}
              </span>
            </div>
            <p className="text-sm text-gray-900 dark:text-white">
              {t('import.completedActivities', { count: imported.completed.length })}
            </p>
            {imported.notes && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('import.hasNotes')}
              </p>
            )}
          </div>
        </div>

        {/* Resolution Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`daily-${dateKey}`}
              value="skip"
              checked={resolution === 'skip'}
              onChange={(e) => handleResolutionChange('dailyData', dateKey, e.target.value)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('import.skipImported')}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`daily-${dateKey}`}
              value="overwrite"
              checked={resolution === 'overwrite'}
              onChange={(e) => handleResolutionChange('dailyData', dateKey, e.target.value)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('import.overwriteExisting')}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`daily-${dateKey}`}
              value="merge"
              checked={resolution === 'merge'}
              onChange={(e) => handleResolutionChange('dailyData', dateKey, e.target.value)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('import.mergeData')}
            </span>
          </label>
        </div>
      </div>
    );
  };

  const renderSettingsConflict = () => {
    const resolution = resolutions.settings || 'skip';

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              {t('import.conflictSettings')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('import.settingsConflictDescription')}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="settings"
              value="skip"
              checked={resolution === 'skip'}
              onChange={(e) => handleResolutionChange('settings', null, e.target.value)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('import.keepExistingSettings')}
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="settings"
              value="overwrite"
              checked={resolution === 'overwrite'}
              onChange={(e) => handleResolutionChange('settings', null, e.target.value)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('import.overwriteSettings')}
            </span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('import.resolveConflicts')}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {t('import.conflictsFound', { count: getConflictCount() })}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Activity Conflicts */}
          {conflicts.activities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('import.activityConflicts', { count: conflicts.activities.length })}
              </h3>
              {conflicts.activities.map((conflict, index) => renderActivityConflict(conflict, index))}
            </div>
          )}

          {/* Daily Data Conflicts */}
          {conflicts.dailyData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('import.dailyDataConflicts', { count: conflicts.dailyData.length })}
              </h3>
              {conflicts.dailyData.map((conflict, index) => renderDailyDataConflict(conflict, index))}
            </div>
          )}

          {/* Settings Conflicts */}
          {conflicts.settings && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {t('import.settingsConflicts')}
              </h3>
              {renderSettingsConflict()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleApplyResolutions}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isProcessing ? t('common.processing') : t('import.applyResolutions')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportConflictResolver;