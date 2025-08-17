import { useState, useEffect, useCallback } from 'react';
import { Bell, Clock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUpcomingReminders, formatTimeUntil } from '../utils/reminders';

const UpcomingReminders = () => {
  const { t } = useTranslation();
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  const updateUpcomingReminders = useCallback(() => {
    const upcoming = getUpcomingReminders(t);
    setUpcomingReminders(upcoming);
  }, [t]);

  useEffect(() => {
    updateUpcomingReminders();
    
    // Update every minute
    const interval = setInterval(updateUpcomingReminders, 60000);
    return () => clearInterval(interval);
  }, [updateUpcomingReminders]);

  // Only show if there are upcoming reminders and component is visible
  if (upcomingReminders.length === 0 || !isVisible) {
    return null;
  }

  // Get the next reminder (closest in time)
  const nextReminder = upcomingReminders[0];

  return (
    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                {nextReminder.label}
              </h3>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {nextReminder.time}
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              {formatTimeUntil(nextReminder.timeUntil, t)}
            </p>
            {nextReminder.message && (
              <p className="text-sm text-blue-600 dark:text-blue-400 italic">
                &ldquo;{nextReminder.message}&rdquo;
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
          aria-label={t('reminders.dismiss')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Show additional reminders if there are more */}
      {upcomingReminders.length > 1 && (
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
            {t('reminders.moreUpcoming', { count: upcomingReminders.length - 1 })}
          </p>
          <div className="space-y-1">
            {upcomingReminders.slice(1, 3).map(reminder => (
              <div key={reminder.id} className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300">
                  {reminder.label}
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {reminder.time} • {formatTimeUntil(reminder.timeUntil, t)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingReminders;