import { useState } from 'react';
import { Plus, Edit3, Trash2, X, Save, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStore from '../store/useStore';

// Sortable Activity Item Component
const SortableActivityItem = ({ activity, index, editingId, editingName, onStartEdit, onSaveEdit, onCancelEdit, onDelete, onEditingNameChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="drag-handle p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Activity Name */}
      <div className="flex-1">
        {editingId === activity.id ? (
          <input
            type="text"
            value={editingName}
            onChange={onEditingNameChange}
            className="w-full px-3 py-2 border border-blue-500 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && onSaveEdit()}
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
              onClick={onSaveEdit}
              className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onStartEdit(activity)}
              className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(activity.id)}
              className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ActivityManager = ({ isOpen, onClose }) => {
  const { 
    activities, 
    addActivity, 
    updateActivity, 
    deleteActivity, 
    reorderActivities,
    getSortedActivities 
  } = useStore();
  
  const [newActivityName, setNewActivityName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sortedActivities = getSortedActivities();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over.id) {
      const oldIndex = sortedActivities.findIndex(activity => activity.id === active.id);
      const newIndex = sortedActivities.findIndex(activity => activity.id === over.id);
      
      reorderActivities(oldIndex, newIndex);
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sortedActivities.map(activity => activity.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {sortedActivities.map((activity, index) => (
                      <SortableActivityItem
                        key={activity.id}
                        activity={activity}
                        index={index}
                        editingId={editingId}
                        editingName={editingName}
                        onStartEdit={handleStartEdit}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        onDelete={handleDeleteActivity}
                        onEditingNameChange={(e) => setEditingName(e.target.value)}
                      />
                    ))}
                  </div>
                </SortableContext>
                
                <DragOverlay>
                  {activeId ? (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-600 shadow-lg">
                      <div className="p-1 text-blue-400">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <span className="text-blue-900 dark:text-blue-100 font-medium">
                        {sortedActivities.find(activity => activity.id === activeId)?.name}
                      </span>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityManager;