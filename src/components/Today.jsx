import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { es as esLocale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, Circle, Save, Plus, GripVertical, Heart, Battery } from 'lucide-react';
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
import ActivityManager from './ActivityManager';
import UpcomingReminders from './UpcomingReminders';
import MoodSelector from './MoodSelector';
import EnergySlider from './EnergySlider';
import JournalEntry from './JournalEntry';

// Sortable Activity Item Component for Today
const SortableTodayActivityItem = ({ activity, isCompleted, onToggle }) => {
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
      className={`sortable-item w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
        isCompleted
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
      } ${isDragging ? 'shadow-lg' : ''}`}
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
      <button
        onClick={onToggle}
        className="flex items-center gap-3 flex-1"
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
    </div>
  );
};

const Today = () => {
  const { t } = useTranslation();
  
  // Use local state for current date to ensure reliable updates
  const [currentDate, setCurrentDate] = useState(() => useStore.getState().currentDate);
  
  // Get store data and functions
  const dailyData = useStore(state => state.dailyData);
  const toggleActivity = useStore(state => state.toggleActivity);
  const updateMood = useStore(state => state.updateMood);
  const updateEnergy = useStore(state => state.updateEnergy);
  const updateJournal = useStore(state => state.updateJournal);
  const getActivitiesForDate = useStore(state => state.getActivitiesForDate);
  const reorderActivities = useStore(state => state.reorderActivities);
  const loadDailyData = useStore(state => state.loadDailyData);
  
  // Sync local state with store
  useEffect(() => {
    useStore.setState({ currentDate });
    loadDailyData(currentDate);
  }, [currentDate, loadDailyData]);
  
  // Navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  
  const goToNextDay = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNextDay(); // Swipe left = next day
    } else if (isRightSwipe) {
      goToPreviousDay(); // Swipe right = previous day
    }
  };

  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const currentData = dailyData[dateKey] || { completed: [], notes: '', mood: null, energy: null, journal: '' };
  const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
  
  
  // Calculate the difference in days from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDateNormalized = new Date(currentDate);
  currentDateNormalized.setHours(0, 0, 0, 0);

  const [showActivityManager, setShowActivityManager] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [selectedMood, setSelectedMood] = useState(currentData.mood);
  const [selectedEnergy, setSelectedEnergy] = useState(currentData.energy);
  const [isJournalEditing, setIsJournalEditing] = useState(false);

  const sortedActivities = getActivitiesForDate(currentDate);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleToggleActivity = (activityId) => {
    toggleActivity(activityId);
  };


  const handleMoodChange = (mood) => {
    setSelectedMood(mood);
    updateMood(mood);
  };

  const handleEnergyChange = (energy) => {
    setSelectedEnergy(energy);
    updateEnergy(energy);
  };

  const handleJournalSave = async (journalText) => {
    updateJournal(journalText);
    setIsJournalEditing(false);
  };

  const handleJournalClear = () => {
    updateJournal('');
    setIsJournalEditing(false);
  };

  const handleJournalToggleEdit = () => {
    setIsJournalEditing(!isJournalEditing);
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

  const completionRate = sortedActivities.length > 0 
    ? Math.round((currentData.completed.length / sortedActivities.length) * 100)
    : 0;

  return (
    <div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4">
          {/* App Title */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Momentum
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dailyTracking.subtitle')}
            </p>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousDay}
              className="touch-button p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {format(currentDate, t('dateNavigation.dateFormat'), { 
                  locale: localStorage.getItem('momentum-language') === 'es' ? esLocale : undefined 
                })}
              </h2>
              {isToday && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {t('navigation.today')}
                </span>
              )}
            </div>
            
            <button
              onClick={goToNextDay}
              className="touch-button p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Navigation */}
          {!isToday && (
            <button
              onClick={goToToday}
              className="w-full btn-secondary text-sm touch-manipulation"
            >
              {t('dateNavigation.goToToday')}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Upcoming Reminders */}
        <UpcomingReminders />

        {/* Mood & Energy Tracking */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dailyTracking.moodAndEnergy')}
            </h2>
          </div>
          
          <div className="space-y-6">
            {/* Mood Selector */}
            <MoodSelector 
              selectedMood={selectedMood}
              onMoodChange={handleMoodChange}
            />
            
            {/* Energy Slider */}
            <EnergySlider 
              energyLevel={selectedEnergy}
              onEnergyChange={handleEnergyChange}
            />
          </div>
          
          {/* Daily Summary */}
          {(selectedMood || selectedEnergy) && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                {t('dailyTracking.todaySummary')}
              </h3>
              <div className="flex items-center gap-4 text-sm">
                {selectedMood && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {selectedMood === 'happy' && '😊'}
                      {selectedMood === 'sad' && '😢'}
                      {selectedMood === 'anxious' && '😰'}
                      {selectedMood === 'calm' && '😌'}
                      {selectedMood === 'neutral' && '😐'}
                      {selectedMood === 'excited' && '🤩'}
                      {selectedMood === 'tired' && '😴'}
                      {selectedMood === 'frustrated' && '😤'}
                    </span>
                    <span className="text-blue-800 dark:text-blue-200">
                      {t(`mood.${selectedMood}`)}
                    </span>
                  </div>
                )}
                {selectedEnergy && (
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-800 dark:text-blue-200">
                      {selectedEnergy}/5 {t('energy.energy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Completion Progress */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('dailyTracking.todayActivities')}
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
            {currentData.completed.length} of {sortedActivities.length} {t('dailyTracking.activitiesCompleted')}
          </p>
        </div>

        {/* Activities List */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('dailyTracking.todayActivities')}
          </h2>
          
          {sortedActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('dailyTracking.noActivities')}
              </p>
              <button
                onClick={() => setShowActivityManager(true)}
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
                  {sortedActivities.map((activity) => {
                    const isCompleted = currentData.completed.includes(activity.id);
                    
                    return (
                      <SortableTodayActivityItem
                        key={activity.id}
                        activity={activity}
                        isCompleted={isCompleted}
                        onToggle={() => handleToggleActivity(activity.id)}
                      />
                    );
                  })}
                                  </div>
                </SortableContext>
                
                <DragOverlay>
                  {activeId ? (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-600 shadow-lg">
                      <div className="p-1 text-blue-400">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <Circle className="w-6 h-6 text-gray-400" />
                        <span className="text-blue-900 dark:text-blue-100 font-medium">
                          {sortedActivities.find(activity => activity.id === activeId)?.name}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
          )}
        </div>

        {/* Journal Entry Section */}
        <JournalEntry
          journalText={currentData.journal}
          onSave={handleJournalSave}
          onClear={handleJournalClear}
          isEditing={isJournalEditing}
          onToggleEdit={handleJournalToggleEdit}
        />
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowActivityManager(true)}
        className="touch-button fixed bottom-24 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40"
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