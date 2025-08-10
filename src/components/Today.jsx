import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, Circle, Save, Plus } from 'lucide-react';
import useStore from '../store/useStore';
import { strings } from '../strings';
import ActivityManager from './ActivityManager';

const Today = () => {
  const {
    activities,
    currentDate,
    dailyData,
    toggleActivity,
    updateNotes,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    getSortedActivities,
  } = useStore();

  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const currentData = dailyData[dateKey] || { completed: [], notes: '' };
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;

  const [notes, setNotes] = useState(currentData.notes);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showActivityManager, setShowActivityManager] = useState(false);

  const sortedActivities = getSortedActivities();

  const handleToggleActivity = (activityId) => {
    toggleActivity(activityId);
  };

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    updateNotes(notes);
    setTimeout(() => setIsSavingNotes(false), 1000);
  };

  const completionRate = sortedActivities.length > 0 
    ? Math.round((currentData.completed.length / sortedActivities.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4">
          {/* App Title */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Momentum
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Build momentum, one day at a time
            </p>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousDay}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {format(currentDate, strings.dateFormat)}
              </h2>
              {isToday && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  Today
                </span>
              )}
            </div>
            
            <button
              onClick={goToNextDay}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Navigation */}
          {!isToday && (
            <button
              onClick={goToToday}
              className="w-full btn-secondary text-sm"
            >
              Go to Today
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Completion Progress */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Progress
            </h2>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {completionRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {currentData.completed.length} of {sortedActivities.length} activities completed
          </p>
        </div>

        {/* Activities List */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {strings.todayActivities}
          </h2>
          
          {sortedActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {strings.noActivities}
              </p>
              <button
                onClick={() => setShowActivityManager(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add Your First Activity
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedActivities.map((activity) => {
                const isCompleted = currentData.completed.includes(activity.id);
                
                return (
                  <button
                    key={activity.id}
                    onClick={() => handleToggleActivity(activity.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 animate-bounce-in" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <span
                      className={`text-left flex-1 ${
                        isCompleted
                          ? 'text-green-800 dark:text-green-200 line-through'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {activity.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {strings.notes}
            </h2>
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="btn-primary px-3 py-1 text-sm flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              {isSavingNotes ? 'Saving...' : strings.saveNotes}
            </button>
          </div>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={strings.notesPlaceholder}
            className="input-field min-h-[120px] resize-none"
            rows={5}
          />
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowActivityManager(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Activity Manager Modal */}
      <ActivityManager 
        isOpen={showActivityManager} 
        onClose={() => setShowActivityManager(false)} 
      />
    </div>
  );
};

export default Today;