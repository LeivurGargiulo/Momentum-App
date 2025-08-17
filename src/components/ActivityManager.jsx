import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStore from '../store/useStore';
import DaySelector from './DaySelector';
import { getActiveDaysString } from '../utils/dayUtils';

// Sortable Activity Item Component
const SortableActivityItem = ({ activity, editingId, editingName, editingDays, onStartEdit, onSaveEdit, onCancelEdit, onDelete, onEditingNameChange, onEditingDaysChange, t }) => {
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

      {/* Activity Content */}
      <div className="flex-1">
        {editingId === activity.id ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editingName}
              onChange={onEditingNameChange}
              className="w-full px-3 py-2 border border-blue-500 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && onSaveEdit()}
              autoFocus
            />
            <DaySelector
              activeDays={editingDays}
              onChange={onEditingDaysChange}
            />
          </div>
        ) : (
          <div>
            <span className="text-gray-900 dark:text-white font-medium">
              {activity.name}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getActiveDaysString(activity, t)}
            </div>
          </div>
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
  const { t } = useTranslation();
  const { 
    addActivity, 
    updateActivity, 
    deleteActivity, 
    reorderActivities,
    getSortedActivities 
  } = useStore();
  
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityDays, setNewActivityDays] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDays, setEditingDays] = useState('all');
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
      addActivity(newActivityName.trim(), newActivityDays);
      setNewActivityName('');
      setNewActivityDays('all');
      setShowAddForm(false);
    }
  };

  const handleStartEdit = (activity) => {
    setEditingId(activity.id);
    setEditingName(activity.name);
    setEditingDays(activity.activeDays || 'all');
  };

  const handleSaveEdit = () => {
    if (editingName.trim()) {
      updateActivity(editingId, editingName.trim(), editingDays);
      setEditingId(null);
      setEditingName('');
      setEditingDays('all');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingDays('all');
  };

  const handleDeleteActivity = (id) => {
    if (window.confirm(t('activityManager.confirmDelete'))) {
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
            {t('settings.manageActivities')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add Activity Form */}
          {showAddForm ? (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {t('activityManager.addNewActivity')}
              </h3>
              <div className="space-y-3 mb-3">
                <input
                  type="text"
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  placeholder={t('activityManager.activityNamePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
                  autoFocus
                />
                <DaySelector
                  activeDays={newActivityDays}
                  onChange={setNewActivityDays}
                />
                <button
                  onClick={handleAddActivity}
                  disabled={!newActivityName.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('onboarding.addActivity')}
                </button>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {t('onboarding.cancel')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('activityManager.addNewActivity')}
            </button>
          )}

          {/* Activities List */}
          {sortedActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('activityManager.noActivitiesYet')}
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                {t('activityManager.addNewActivity')}
              </button>
            </div>
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
                <div className="space-y-3">
                  {sortedActivities.map((activity, index) => (
                    <SortableActivityItem
                      key={activity.id}
                      activity={activity}
                      index={index}
                      editingId={editingId}
                      editingName={editingName}
                      editingDays={editingDays}
                      onStartEdit={handleStartEdit}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={handleCancelEdit}
                      onDelete={handleDeleteActivity}
                      onEditingNameChange={(e) => setEditingName(e.target.value)}
                      onEditingDaysChange={setEditingDays}
                      t={t}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                    <span className="text-gray-900 dark:text-white font-medium">
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
  );
};

export default ActivityManager;