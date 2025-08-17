import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { getAllDays, normalizeActiveDays } from '../utils/dayUtils';

const DaySelector = ({ activeDays, onChange, disabled = false }) => {
  const { t } = useTranslation();
  const [isEveryDay, setIsEveryDay] = useState(activeDays === 'all');
  const [selectedDays, setSelectedDays] = useState(
    Array.isArray(activeDays) ? activeDays : []
  );

  const allDays = getAllDays();

  // Update internal state when activeDays prop changes
  useEffect(() => {
    const normalized = normalizeActiveDays(activeDays);
    if (normalized === 'all') {
      setIsEveryDay(true);
      setSelectedDays([]);
    } else {
      setIsEveryDay(false);
      setSelectedDays(normalized);
    }
  }, [activeDays]);

  const handleEveryDayToggle = () => {
    const newIsEveryDay = !isEveryDay;
    setIsEveryDay(newIsEveryDay);
    
    if (newIsEveryDay) {
      setSelectedDays([]);
      onChange('all');
    } else {
      // Default to all days when switching from "every day" to "specific days"
      const allDaysArray = getAllDays();
      setSelectedDays(allDaysArray);
      onChange(allDaysArray);
    }
  };

  const handleDayToggle = (day) => {
    if (isEveryDay) return; // Shouldn't happen, but safety check
    
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    // Ensure at least one day is selected
    if (newSelectedDays.length === 0) {
      return;
    }
    
    setSelectedDays(newSelectedDays);
    
    // If all days are selected, switch to "every day"
    if (newSelectedDays.length === 7) {
      setIsEveryDay(true);
      setSelectedDays([]);
      onChange('all');
    } else {
      onChange(newSelectedDays);
    }
  };

  const getDayShortName = (day) => {
    return t(`daysOfWeek.short.${day}`);
  };

  const getDayFullName = (day) => {
    return t(`daysOfWeek.${day}`);
  };

  return (
    <div className="space-y-3">
      {/* Every Day Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('activityManager.daySettings')}
          </span>
        </div>
      </div>

      {/* Every Day Switch */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {t('activityManager.everyDay')}
        </span>
        <button
          type="button"
          onClick={handleEveryDayToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isEveryDay ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEveryDay ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Specific Days Selection */}
      {!isEveryDay && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('activityManager.selectDays')}
          </span>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map(day => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  disabled={disabled}
                  className={`p-2 text-xs font-medium rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  title={getDayFullName(day)}
                >
                  {getDayShortName(day)}
                </button>
              );
            })}
          </div>
          
          {/* Selected days count */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {selectedDays.length === 1 
              ? t('activityManager.oneDaySelected', { count: selectedDays.length })
              : t('activityManager.daysSelected', { count: selectedDays.length })
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default DaySelector;