import { create } from 'zustand';
import { formatDateKey, loadActivities, saveActivities, loadDailyData, saveDailyData, loadSettings, saveSettings } from '../utils/storage';
import { getActivitiesForDate, normalizeActiveDays, getDefaultActiveDays } from '../utils/dayUtils';
import { updateLastDataChange, markOfflineUsage } from '../utils/offline';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

const useStore = create((set, get) => ({
  // State
  activities: [],
  currentDate: new Date(),
  dailyData: {},
  settings: { darkMode: false },
  isOnboarded: false,
  
  // Initialize store
  initialize: () => {
    const loadedActivities = loadActivities();
    const settings = loadSettings();
    const isOnboarded = loadedActivities.length > 0;
    
    // Migrate existing activities to include activeDays property
    const migratedActivities = loadedActivities.map(activity => ({
      ...activity,
      activeDays: activity.activeDays ? normalizeActiveDays(activity.activeDays) : getDefaultActiveDays()
    }));
    
    // Save migrated activities if any changes were made
    const needsMigration = migratedActivities.some((activity, index) => 
      !loadedActivities[index].activeDays
    );
    if (needsMigration) {
      saveActivities(migratedActivities);
    }
    
    set({ 
      activities: migratedActivities, 
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
  addActivity: (name, activeDays = getDefaultActiveDays()) => {
    const newActivity = { 
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), 
      name,
      order: get().activities.length,
      activeDays: normalizeActiveDays(activeDays)
    };
    const updatedActivities = [...get().activities, newActivity];
    
    set({ activities: updatedActivities });
    saveActivities(updatedActivities);
    updateLastDataChange();
    markOfflineUsage();
    
    // If this is the first activity, mark as onboarded
    if (get().activities.length === 1) {
      set({ isOnboarded: true });
    }
  },
  
  updateActivity: (id, name, activeDays) => {
    const updatedActivities = get().activities.map(activity =>
      activity.id === id ? { 
        ...activity, 
        name,
        ...(activeDays !== undefined && { activeDays: normalizeActiveDays(activeDays) })
      } : activity
    );
    
    set({ activities: updatedActivities });
    saveActivities(updatedActivities);
    updateLastDataChange();
    markOfflineUsage();
  },
  
  deleteActivity: (id) => {
    const updatedActivities = get().activities.filter(activity => activity.id !== id);
    
    // Reorder remaining activities
    const reorderedActivities = updatedActivities.map((activity, index) => ({
      ...activity,
      order: index
    }));
    
    set({ activities: reorderedActivities });
    saveActivities(reorderedActivities);
    updateLastDataChange();
    markOfflineUsage();
    
    // Remove from all daily data
    const dailyData = get().dailyData;
    Object.keys(dailyData).forEach(dateKey => {
      if (dailyData[dateKey].completed.includes(id)) {
        dailyData[dateKey].completed = dailyData[dateKey].completed.filter(activityId => activityId !== id);
      }
    });
    set({ dailyData });
  },
  
  // Activity reordering
  moveActivityUp: (id) => {
    const activities = get().activities;
    const currentIndex = activities.findIndex(activity => activity.id === id);
    
    if (currentIndex > 0) {
      const updatedActivities = [...activities];
      const temp = updatedActivities[currentIndex];
      updatedActivities[currentIndex] = updatedActivities[currentIndex - 1];
      updatedActivities[currentIndex - 1] = temp;
      
      // Update order property
      updatedActivities.forEach((activity, index) => {
        activity.order = index;
      });
      
      set({ activities: updatedActivities });
      saveActivities(updatedActivities);
    }
  },
  
  moveActivityDown: (id) => {
    const activities = get().activities;
    const currentIndex = activities.findIndex(activity => activity.id === id);
    
    if (currentIndex < activities.length - 1) {
      const updatedActivities = [...activities];
      const temp = updatedActivities[currentIndex];
      updatedActivities[currentIndex] = updatedActivities[currentIndex + 1];
      updatedActivities[currentIndex + 1] = temp;
      
      // Update order property
      updatedActivities.forEach((activity, index) => {
        activity.order = index;
      });
      
      set({ activities: updatedActivities });
      saveActivities(updatedActivities);
    }
  },
  
  // Drag and drop reordering
  reorderActivities: (oldIndex, newIndex) => {
    const activities = get().activities;
    
    if (oldIndex === newIndex) return;
    
    const updatedActivities = [...activities];
    const [movedActivity] = updatedActivities.splice(oldIndex, 1);
    updatedActivities.splice(newIndex, 0, movedActivity);
    
    // Update order property
    updatedActivities.forEach((activity, index) => {
      activity.order = index;
    });
    
    set({ activities: updatedActivities });
    saveActivities(updatedActivities);
  },
  
  // Get sorted activities
  getSortedActivities: () => {
    return get().activities.sort((a, b) => a.order - b.order);
  },
  
  // Get activities for a specific date (filtered by day of week)
  getActivitiesForDate: (date) => {
    const sortedActivities = get().getSortedActivities();
    return getActivitiesForDate(sortedActivities, date);
  },
  
  // Update activity days specifically
  updateActivityDays: (id, activeDays) => {
    const updatedActivities = get().activities.map(activity =>
      activity.id === id ? { 
        ...activity, 
        activeDays: normalizeActiveDays(activeDays)
      } : activity
    );
    
    set({ activities: updatedActivities });
    saveActivities(updatedActivities);
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
  
  updateMood: (mood) => {
    const dateKey = formatDateKey(get().currentDate);
    const currentData = get().dailyData[dateKey] || { completed: [], notes: '', mood: null, energy: null, journal: '' };
    
    const updatedData = {
      ...currentData,
      mood
    };
    
    set(state => ({
      dailyData: {
        ...state.dailyData,
        [dateKey]: updatedData
      }
    }));
    
    saveDailyData(dateKey, updatedData);
    updateLastDataChange();
    markOfflineUsage();
  },
  
  updateEnergy: (energy) => {
    const dateKey = formatDateKey(get().currentDate);
    const currentData = get().dailyData[dateKey] || { completed: [], notes: '', mood: null, energy: null, journal: '' };
    
    const updatedData = {
      ...currentData,
      energy
    };
    
    set(state => ({
      dailyData: {
        ...state.dailyData,
        [dateKey]: updatedData
      }
    }));
    
    saveDailyData(dateKey, updatedData);
    updateLastDataChange();
    markOfflineUsage();
  },
  
  updateJournal: (journal) => {
    const dateKey = formatDateKey(get().currentDate);
    const currentData = get().dailyData[dateKey] || { completed: [], notes: '', mood: null, energy: null, journal: '' };
    
    const updatedData = {
      ...currentData,
      journal
    };
    
    set(state => ({
      dailyData: {
        ...state.dailyData,
        [dateKey]: updatedData
      }
    }));
    
    saveDailyData(dateKey, updatedData);
    updateLastDataChange();
    markOfflineUsage();
  },
  
  toggleActivity: (activityId) => {
    const dateKey = formatDateKey(get().currentDate);
    const currentData = get().dailyData[dateKey] || { completed: [], notes: '', mood: null, energy: null, journal: '' };
    
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
    updateLastDataChange();
    markOfflineUsage();
  },
  
  updateNotes: (notes) => {
    const dateKey = formatDateKey(get().currentDate);
    const currentData = get().dailyData[dateKey] || { completed: [], notes: '', mood: null, energy: null, journal: '' };
    
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
    updateLastDataChange();
    markOfflineUsage();
  },
  
  // Date navigation
  setCurrentDate: (date) => {
    // Save ALL current day's data before switching dates
    const currentDateKey = formatDateKey(get().currentDate);
    const currentData = get().dailyData[currentDateKey];
    
    // Save if there's any data (completed activities, notes, journal, mood, or energy)
    if (currentData && (
      currentData.completed?.length > 0 || 
      currentData.notes || 
      currentData.journal || 
      currentData.mood || 
      currentData.energy
    )) {
      // Ensure ALL data is persisted to localStorage
      saveDailyData(currentDateKey, currentData);
    }
    
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
    updateLastDataChange();
    markOfflineUsage();
    
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  // Statistics helpers
  getCompletionRate: () => {
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
  
  // Calculate current streak
  getCurrentStreak: () => {
    const dailyData = get().dailyData;
    const activities = get().activities;
    
    if (activities.length === 0) return 0;
    
    let streak = 0;
    
    // Check from today backwards
    const today = new Date();
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = formatDateKey(checkDate);
      
      const dayData = dailyData[dateKey];
      if (dayData && dayData.completed.length > 0) {
        // If there's any completed activity on this day, count it as a streak day
        streak++;
      } else {
        // If no completed activities, break the streak
        break;
      }
    }
    
    return streak;
  },
  
  // Get mood and energy statistics
  getMoodStats: (timeRange = 'week') => {
    const dailyData = get().dailyData;
    const dateKeys = Object.keys(dailyData).sort();
    
    if (dateKeys.length === 0) return { averageMood: null, moodTrend: [], hasData: false };
    
    // Filter by time range
    const now = new Date();
    const filteredKeys = dateKeys.filter(dateKey => {
      const date = new Date(dateKey);
      if (timeRange === 'week') {
        return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === 'month') {
        return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      return true; // all time
    });
    
    const moodData = filteredKeys
      .map(dateKey => dailyData[dateKey])
      .filter(data => data.mood)
      .map(data => data.mood);
    
    if (moodData.length === 0) return { averageMood: null, moodTrend: [], hasData: false };
    
    // Calculate average mood (convert to numeric for calculation)
    const moodValues = {
      'sad': 1, 'frustrated': 2, 'anxious': 3, 'tired': 4, 'neutral': 5, 
      'calm': 6, 'happy': 7, 'excited': 8
    };
    
    const numericMoods = moodData.map(mood => moodValues[mood] || 5);
    const averageMood = numericMoods.reduce((sum, val) => sum + val, 0) / numericMoods.length;
    
    // Create trend data
    const moodTrend = filteredKeys
      .map(dateKey => ({
        date: dateKey,
        mood: dailyData[dateKey].mood,
        moodValue: moodValues[dailyData[dateKey].mood] || 5
      }))
      .filter(item => item.mood);
    
    return {
      averageMood,
      moodTrend,
      hasData: true
    };
  },
  
  getEnergyStats: (timeRange = 'week') => {
    const dailyData = get().dailyData;
    const dateKeys = Object.keys(dailyData).sort();
    
    if (dateKeys.length === 0) return { averageEnergy: null, energyTrend: [], hasData: false };
    
    // Filter by time range
    const now = new Date();
    const filteredKeys = dateKeys.filter(dateKey => {
      const date = new Date(dateKey);
      if (timeRange === 'week') {
        return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === 'month') {
        return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      return true; // all time
    });
    
    const energyData = filteredKeys
      .map(dateKey => dailyData[dateKey])
      .filter(data => data.energy)
      .map(data => data.energy);
    
    if (energyData.length === 0) return { averageEnergy: null, energyTrend: [], hasData: false };
    
    const averageEnergy = energyData.reduce((sum, val) => sum + val, 0) / energyData.length;
    
    // Create trend data
    const energyTrend = filteredKeys
      .map(dateKey => ({
        date: dateKey,
        energy: dailyData[dateKey].energy
      }))
      .filter(item => item.energy !== null && item.energy !== undefined);
    
    return {
      averageEnergy,
      energyTrend,
      hasData: true
    };
  },
  
  // Get correlation between mood/energy and activity completion
  getMoodEnergyCorrelation: () => {
    const dailyData = get().dailyData;
    const activities = get().activities;
    
    if (activities.length === 0) return { correlations: [], hasData: false };
    
    const correlations = [];
    
    // For each activity, calculate correlation with mood and energy
    activities.forEach(activity => {
      const activityData = Object.entries(dailyData)
        .filter(([, data]) => data.completed.includes(activity.id))
        .map(([dateKey, data]) => ({
          date: dateKey,
          mood: data.mood,
          energy: data.energy
        }))
        .filter(item => item.mood || item.energy);
      
      if (activityData.length > 0) {
        const avgMood = activityData.filter(item => item.mood).length > 0 
          ? activityData.filter(item => item.mood).reduce((sum, item) => {
              const moodValues = {
                'sad': 1, 'frustrated': 2, 'anxious': 3, 'tired': 4, 'neutral': 5, 
                'calm': 6, 'happy': 7, 'excited': 8
              };
              return sum + (moodValues[item.mood] || 5);
            }, 0) / activityData.filter(item => item.mood).length
          : null;
        
        const avgEnergy = activityData.filter(item => item.energy).length > 0
          ? activityData.filter(item => item.energy).reduce((sum, item) => sum + item.energy, 0) / activityData.filter(item => item.energy).length
          : null;
        
        correlations.push({
          activity: activity.name,
          avgMood,
          avgEnergy,
          completionCount: activityData.length
        });
      }
    });
    
    return {
      correlations: correlations.sort((a, b) => b.completionCount - a.completionCount),
      hasData: correlations.length > 0
    };
  },
  
  // Get journal statistics and entries
  getJournalStats: (timeRange = 'month') => {
    const dailyData = get().dailyData;
    const dateKeys = Object.keys(dailyData).sort().reverse();
    
    if (dateKeys.length === 0) return { entries: [], stats: {}, hasData: false };
    
    // Filter by time range
    const now = new Date();
    const filteredKeys = dateKeys.filter(dateKey => {
      const date = new Date(dateKey);
      if (timeRange === 'week') {
        return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeRange === 'month') {
        return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      return true; // all time
    });
    
    const journalEntries = filteredKeys
      .map(dateKey => ({
        date: dateKey,
        text: dailyData[dateKey].journal || '',
        hasEntry: !!(dailyData[dateKey].journal && dailyData[dateKey].journal.trim())
      }))
      .filter(entry => entry.hasEntry);
    
    if (journalEntries.length === 0) return { entries: [], stats: {}, hasData: false };
    
    // Calculate statistics
    const totalEntries = journalEntries.length;
    const totalDays = filteredKeys.length;
    const consistencyRate = totalDays > 0 ? (totalEntries / totalDays) * 100 : 0;
    
    // Calculate average entry length
    const totalCharacters = journalEntries.reduce((sum, entry) => sum + entry.text.length, 0);
    const avgEntryLength = totalCharacters / totalEntries;
    
    // Calculate word counts
    const wordCounts = journalEntries.map(entry => 
      entry.text.trim().split(/\s+/).filter(word => word.length > 0).length
    );
    const avgWordCount = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
    
    return {
      entries: journalEntries,
      stats: {
        totalEntries,
        totalDays,
        consistencyRate,
        avgEntryLength,
        avgWordCount,
        longestEntry: Math.max(...journalEntries.map(e => e.text.length)),
        shortestEntry: Math.min(...journalEntries.map(e => e.text.length))
      },
      hasData: true
    };
  },
  
  // Search journal entries
  searchJournalEntries: (searchTerm) => {
    const dailyData = get().dailyData;
    const dateKeys = Object.keys(dailyData).sort().reverse();
    
    if (!searchTerm || searchTerm.trim().length === 0) return [];
    
    const searchLower = searchTerm.toLowerCase();
    
    return dateKeys
      .map(dateKey => ({
        date: dateKey,
        text: dailyData[dateKey].journal || '',
        hasEntry: !!(dailyData[dateKey].journal && dailyData[dateKey].journal.trim())
      }))
      .filter(entry => entry.hasEntry && entry.text.toLowerCase().includes(searchLower))
      .map(entry => ({
        ...entry,
        preview: entry.text.length > 100 
          ? entry.text.substring(0, 100) + '...' 
          : entry.text
      }));
  },
  
  // Get share statistics data
  getShareStatsData: (timeRange = 'daily') => {
    const activities = get().activities;
    const activityStats = get().getActivityStats();
    const completionRate = get().getCompletionRate(timeRange);
    const currentStreak = get().getCurrentStreak();
    
    if (activities.length === 0) {
      return {
        completionRate: 0,
        mostCompleted: '',
        leastCompleted: '',
        currentStreak: 0,
        hasData: false
      };
    }
    
    const mostCompleted = activityStats.length > 0 ? activityStats[0].name : '';
    const leastCompleted = activityStats.length > 0 ? activityStats[activityStats.length - 1].name : '';
    
    return {
      completionRate: Math.round(completionRate),
      mostCompleted,
      leastCompleted,
      currentStreak,
      hasData: true
    };
  },
  
  // Setup default activities
  setupDefaultActivities: () => {
    // Import default activities from the current language
    const currentLanguage = localStorage.getItem('momentum-language') || 'en';
    
    // Use imported translation files based on language
    let defaultActivities = [];
    try {
      if (currentLanguage === 'es') {
        defaultActivities = esTranslations.defaultActivities;
      } else {
        defaultActivities = enTranslations.defaultActivities;
      }
    } catch (error) {
      // Fallback to hardcoded activities if translation files can't be loaded
      if (currentLanguage === 'es') {
        defaultActivities = [
          'Tomar medicación',
          'Ejercicio',
          'Meditación',
          'Diario',
          'Llamar a un amigo',
          'Salir al exterior',
          'Leer',
          'Practicar gratitud',
          'Comer comidas saludables',
          'Dormir lo suficiente'
        ];
      } else {
        defaultActivities = [
          'Take medication',
          'Exercise',
          'Meditation',
          'Journal',
          'Call a friend',
          'Go outside',
          'Read',
          'Practice gratitude',
          'Eat healthy meals',
          'Get enough sleep'
        ];
      }
    }
    
    const activities = defaultActivities.map((name, index) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      order: index
    }));
    
    set({ activities, isOnboarded: true });
    saveActivities(activities);
  }
}));

export default useStore;