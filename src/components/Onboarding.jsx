import { useState } from 'react';
import { Check, Plus, Edit, Trash2, ArrowRight } from 'lucide-react';
import useStore from '../store/useStore';
import { strings } from '../strings';

const Onboarding = () => {
  const { activities, addActivity, updateActivity, deleteActivity, setupDefaultActivities } = useStore();
  const [newActivityName, setNewActivityName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleAddActivity = () => {
    if (newActivityName.trim()) {
      addActivity(newActivityName.trim());
      setNewActivityName('');
    }
  };

  const handleStartEditing = (activity) => {
    setEditingId(activity.id);
    setEditingName(activity.name);
  };

  const handleSaveEdit = () => {
    if (editingName.trim()) {
      updateActivity(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      deleteActivity(id);
    }
  };

  const handleUseDefaults = () => {
    setupDefaultActivities();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {strings.welcome}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {strings.welcomeSubtitle}
          </p>
        </div>

        {/* Quick Setup */}
        {activities.length === 0 && (
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

        {/* Add New Activity */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {strings.addActivity}
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
              placeholder="Enter activity name..."
              className="input-field flex-1"
            />
            <button
              onClick={handleAddActivity}
              disabled={!newActivityName.trim()}
              className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Your Activities ({activities.length})
          </h2>
          
          {activities.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No activities yet. Add some activities to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  {editingId === activity.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="input-field flex-1"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="text-green-600 hover:text-green-700 p-1"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-900 dark:text-white flex-1">
                        {activity.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEditing(activity)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Get Started Button */}
        {activities.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-8 py-3 text-lg"
            >
              {strings.getStarted}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;