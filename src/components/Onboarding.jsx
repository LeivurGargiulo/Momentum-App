import { useState } from 'react';
import { Check, Plus, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import { strings } from '../strings';
import ActivityManager from './ActivityManager';

const Onboarding = () => {
  const { activities, setupDefaultActivities, getSortedActivities } = useStore();
  const [showActivityManager, setShowActivityManager] = useState(false);

  const sortedActivities = getSortedActivities();

  const handleUseDefaults = () => {
    setupDefaultActivities();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Momentum
          </h1>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {strings.welcome}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {strings.welcomeSubtitle}
          </p>
        </div>

        {/* Quick Setup */}
        {sortedActivities.length === 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Quick Setup
            </h2>
            <button
              onClick={handleUseDefaults}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Use Default Activities
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              Start with common mental health activities
            </p>
          </div>
        )}

        {/* Activities Summary */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Activities ({sortedActivities.length})
            </h2>
            <button
              onClick={() => setShowActivityManager(true)}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Manage
            </button>
          </div>
          
          {sortedActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No activities yet. Add some activities to get started!
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
            <div className="space-y-2">
              {sortedActivities.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-900 dark:text-white">
                    {activity.name}
                  </span>
                </div>
              ))}
              {sortedActivities.length > 3 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  +{sortedActivities.length - 3} more activities
                </p>
              )}
            </div>
          )}
        </div>

        {/* Get Started Button */}
        {sortedActivities.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-8 py-3 text-lg flex items-center gap-2 mx-auto"
            >
              {strings.getStarted}
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              You can always manage your activities later in Settings
            </p>
          </div>
        )}
      </div>

      {/* Activity Manager Modal */}
      <ActivityManager 
        isOpen={showActivityManager} 
        onClose={() => setShowActivityManager(false)} 
      />
    </div>
  );
};

export default Onboarding;