import { create } from 'zustand';
import { formatDateKey, loadActivities, saveActivities, loadDailyData, saveDailyData, loadSettings, saveSettings } from '../utils/storage';
import { strings } from '../strings';

const useStore = create((set, get) => ({
  // State
  activities: [],
  currentDate: new Date(),
  dailyData: {},
  settings: { darkMode: false },
  isOnboarded: false,
  
  // Initialize store
  initialize: () => {
    const activities = loadActivities();
    const settings = loadSettings();
    const isOnboarded = activities.length > 0;
    
    set({ 
      activities, 
      settings, 
      isOnboarded,
      currentDate: new Date()
    });
    
    // Load today's data
    get().loadDailyData(new Date());
    
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    }
  },
  
  // Activity management
  addActivity: (name) => {
    const newActivity = { id: Date.now().toString(), name };
    const updatedActivities = [...get().activities, newActivity];
    
    set({ activities: updatedActivities });
    saveActivities(updatedActivities);
    
    // If this is the first activity, mark as onboarded
    if (get().activities.length === 1) {
      set({ isOnboarded: true });
    }
  },
  
  updateActivity: (id, name) => {
    const updatedActivities = get().activities.map(activity =>
      activity.id === id ? { ...activity, name } : activity
    );
    
    set({ activities: updatedActivities });
    saveActivities(updatedActivities);
  },
  
  deleteActivity: (id) => {
    const updatedActivities = get().activities.filter(activity => activity.id !== id);
    
    set({ activities: updatedActivities });
    saveActivities(updatedActivities);
    
    // Remove from all daily data
    const dailyData = get().dailyData;
    Object.keys(dailyData).forEach(dateKey => {
      if (dailyData[dateKey].completed.includes(id)) {
        dailyData[dateKey].completed = dailyData[dateKey].completed.filter(activityId => activityId !== id);
      }
    });
    set({ dailyData });
  },
  
  // Daily data management
  loadDailyData: (date) => {
    const dateKey = formatDateKey(date);
    const data = loadDailyData(dateKey);
    
    set(state => ({
      dailyData: {
        ...state.dailyData,
        [dateKey]: data
      }
    }));
  },
  
  toggleActivity: (activityId) => {
    const dateKey = formatDateKey(get().currentDate);
    const currentData = get().dailyData[dateKey] || { completed: [], notes: '' };
    
    const isCompleted = currentData.completed.includes(activityId);
    const updatedCompleted = isCompleted
      ? currentData.completed.filter(id => id !== activityId)
      : [...currentData.completed, activityId];
    
    const updatedData = {
      ...currentData,
      completed: updatedCompleted
    };
    
    set(state => ({
      dailyData: {
        ...state.dailyData,
        [dateKey]: updatedData
      }
    }));
    
    saveDailyData(dateKey, updatedData);
  },
  
  updateNotes: (notes) => {
    const dateKey = formatDateKey(get().currentDate);
    const currentData = get().dailyData[dateKey] || { completed: [], notes: '' };
    
    const updatedData = {
      ...currentData,
      notes
    };
    
    set(state => ({
      dailyData: {
        ...state.dailyData,
        [dateKey]: updatedData
      }
    }));
    
    saveDailyData(dateKey, updatedData);
  },
  
  // Date navigation
  setCurrentDate: (date) => {
    set({ currentDate: date });
    get().loadDailyData(date);
  },
  
  goToPreviousDay: () => {
    const newDate = new Date(get().currentDate);
    newDate.setDate(newDate.getDate() - 1);
    get().setCurrentDate(newDate);
  },
  
  goToNextDay: () => {
    const newDate = new Date(get().currentDate);
    newDate.setDate(newDate.getDate() + 1);
    get().setCurrentDate(newDate);
  },
  
  goToToday: () => {
    get().setCurrentDate(new Date());
  },
  
  // Settings
  toggleDarkMode: () => {
    const newSettings = {
      ...get().settings,
      darkMode: !get().settings.darkMode
    };
    
    set({ settings: newSettings });
    saveSettings(newSettings);
    
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  // Statistics helpers
  getCompletionRate: (period = 'daily') => {
    const activities = get().activities;
    const dailyData = get().dailyData;
    
    if (activities.length === 0) return 0;
    
    const dateKeys = Object.keys(dailyData);
    if (dateKeys.length === 0) return 0;
    
    let totalPossible = 0;
    let totalCompleted = 0;
    
    dateKeys.forEach(dateKey => {
      const data = dailyData[dateKey];
      totalPossible += activities.length;
      totalCompleted += data.completed.length;
    });
    
    return totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
  },
  
  getActivityStats: () => {
    const activities = get().activities;
    const dailyData = get().dailyData;
    
    if (activities.length === 0) return [];
    
    const activityCounts = {};
    activities.forEach(activity => {
      activityCounts[activity.id] = 0;
    });
    
    Object.values(dailyData).forEach(data => {
      data.completed.forEach(activityId => {
        if (activityCounts[activityId] !== undefined) {
          activityCounts[activityId]++;
        }
      });
    });
    
    return activities.map(activity => ({
      ...activity,
      count: activityCounts[activity.id] || 0
    })).sort((a, b) => b.count - a.count);
  },
  
  // Setup default activities
  setupDefaultActivities: () => {
    const defaultActivities = strings.defaultActivities.map(name => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name
    }));
    
    set({ activities: defaultActivities, isOnboarded: true });
    saveActivities(defaultActivities);
  }
}));

export default useStore;