import React from 'react';
import { useTranslation } from 'react-i18next';

const MoodSelector = ({ selectedMood, onMoodChange, disabled = false }) => {
  const { t } = useTranslation();
  
  const moodOptions = [
    { value: 'happy', label: t('mood.happy'), emoji: '😊', color: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700' },
    { value: 'sad', label: t('mood.sad'), emoji: '😢', color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' },
    { value: 'anxious', label: t('mood.anxious'), emoji: '😰', color: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700' },
    { value: 'calm', label: t('mood.calm'), emoji: '😌', color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700' },
    { value: 'neutral', label: t('mood.neutral'), emoji: '😐', color: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' },
    { value: 'excited', label: t('mood.excited'), emoji: '🤩', color: 'bg-pink-100 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700' },
    { value: 'tired', label: t('mood.tired'), emoji: '😴', color: 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700' },
    { value: 'frustrated', label: t('mood.frustrated'), emoji: '😤', color: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700' },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('mood.howAreYouFeeling')}
      </label>
      <div className="grid grid-cols-4 gap-2">
        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => !disabled && onMoodChange(selectedMood === mood.value ? null : mood.value)}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
              ${selectedMood === mood.value 
                ? `${mood.color} scale-105 shadow-md` 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
            `}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
            <span className={`text-xs font-medium ${
              selectedMood === mood.value 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {mood.label}
            </span>
          </button>
        ))}
      </div>
      
      {selectedMood && (
        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={() => !disabled && onMoodChange(null)}
            disabled={disabled}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
          >
            {t('mood.clearSelection')}
          </button>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;