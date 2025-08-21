import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';
import { formatDateKey } from '../utils/storage';

const Calendar = () => {
  const { t, i18n } = useTranslation();
  const { dailyData, activities, setCurrentDate, getActivitiesForDate, loadDailyData } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load daily data for all visible days when month changes
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const visibleDays = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Load data for all visible days
    visibleDays.forEach(day => {
      loadDailyData(day);
    });
  }, [currentMonth, loadDailyData]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  };

  const getDayData = (date) => {
    const dateKey = formatDateKey(date);
    return dailyData[dateKey] || { completed: [], mood: null, energy: null };
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      calm: '😌',
      neutral: '😐',
      excited: '🤩',
      tired: '😴',
      frustrated: '😤'
    };
    return moodEmojis[mood] || '';
  };

  const getEnergyColor = (energy) => {
    if (!energy) return '';
    if (energy <= 2) return 'text-red-500';
    if (energy <= 3) return 'text-orange-500';
    if (energy <= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const localizedWeekDays = weekDays.map(day => t(`calendar.weekDays.${day.toLowerCase()}`));

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={t('calendar.previousMonth')}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {format(currentMonth, 'MMMM yyyy', { locale: i18n.language === 'es' ? es : undefined })}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={t('calendar.nextMonth')}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {localizedWeekDays.map((day, index) => (
            <div
              key={index}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}

          {days.map((day, index) => {
            const dayData = getDayData(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const activitiesForDay = getActivitiesForDate(day);
            const totalActivities = activitiesForDay.length;
            // Only count completed activities that were actually active on this day
            const activeDayActivityIds = activitiesForDay.map(activity => activity.id);
            const completedCount = dayData.completed.filter(id => activeDayActivityIds.includes(id)).length;

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  relative p-1 sm:p-2 h-16 sm:h-20 rounded-lg border transition-all
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900 opacity-50'}
                  ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200 dark:border-gray-700'}
                  ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  hover:bg-gray-50 dark:hover:bg-gray-700/50
                `}
              >
                <div className="flex flex-col items-center justify-between h-full">
                  <span className={`
                    text-xs sm:text-sm font-medium
                    ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}
                    ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>

                  {isCurrentMonth && (
                    <div className="flex flex-col items-center gap-0.5 w-full">
                      {completedCount > 0 && (
                        <div className="flex items-center justify-center">
                          <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">
                            {completedCount}/{totalActivities}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-0.5 min-h-[16px]">
                        {dayData.mood && (
                          <span className="text-[10px] sm:text-sm" title={t(`mood.${dayData.mood}`)}>
                            {getMoodEmoji(dayData.mood)}
                          </span>
                        )}
                        {dayData.energy && (
                          <div className={`flex ${getEnergyColor(dayData.energy)}`}>
                            {[...Array(Math.min(dayData.energy, 5))].map((_, i) => (
                              <span key={i} className="text-[8px] sm:text-[10px]">⚡</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {t('calendar.legend')}
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">📊</span>
            <span className="text-gray-600 dark:text-gray-400">{t('calendar.tasksCompleted')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>😊</span>
            <span className="text-gray-600 dark:text-gray-400">{t('calendar.moodIndicator')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-green-500">⚡</span>
            <span className="text-gray-600 dark:text-gray-400">{t('calendar.energyLevel')}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/20 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">{t('calendar.today')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;