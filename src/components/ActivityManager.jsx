import { useState } from 'react';
import { Plus, Edit3, Trash2, ChevronUp, ChevronDown, X, Save } from 'lucide-react';
import useStore from '../store/useStore';

const ActivityManager = ({ isOpen, onClose }) => {
  const { 
    activities, 
    addActivity, 
    updateActivity, 
    deleteActivity, 
    moveActivityUp, 
    moveActivityDown,
    getSortedActivities 
  } = useStore();
  
  const [newActivityName, setNewActivityName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const sortedActivities = getSortedActivities();

  const handleAddActivity = () => {
    if (newActivityName.trim()) {
      addActivity(newActivityName.trim());
      setNewActivityName('');
      setShowAddForm(false);
    }
  };

  const handleStartEdit = (activity) => {
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

  const handleDeleteActivity = (id) => {
    if (window.confirm('Are you sure you want to delete this activity? This will remove it from future days but keep historical data.')) {
      deleteActivity(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Manage Activities
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add New Activity */}
          <div className="mb-6">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add New Activity</span>
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  placeholder="Enter activity name..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddActivity}
                    disabled={!newActivityName.trim()}
                    className="flex-1 btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Activity
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewActivityName('');
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Activities List */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Your Activities ({sortedActivities.length})
            </h3>
            
            {sortedActivities.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No activities yet. Add your first activity above!
              </p>
            ) : (
              sortedActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveActivityUp(activity.id)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveActivityDown(activity.id)}
                      disabled={index === sortedActivities.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Activity Name */}
                  <div className="flex-1">
                    {editingId === activity.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-500 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-900 dark:text-white font-medium">
                        {activity.name}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    {editingId === activity.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(activity)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityManager;