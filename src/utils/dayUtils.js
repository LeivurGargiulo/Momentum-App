// Day utility functions for activity scheduling

/**
 * Get the day of the week for a given date
 * @param {Date} date - The date to get the day for
 * @returns {string} - Day name in lowercase (e.g., "monday", "tuesday")
 */
export const getDayOfWeek = (date) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

/**
 * Get all days of the week in order
 * @returns {string[]} - Array of day names starting with Monday
 */
export const getAllDays = () => {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
};

/**
 * Check if an activity should be active on a given date
 * @param {Object} activity - The activity object
 * @param {Date} date - The date to check
 * @returns {boolean} - True if activity should be shown on this date
 */
export const isDayActive = (activity, date) => {
  // Backward compatibility: if no activeDays property, show every day
  if (!activity.activeDays || activity.activeDays === 'all') {
    return true;
  }
  
  // If activeDays is an array, check if current day is included
  if (Array.isArray(activity.activeDays)) {
    const currentDay = getDayOfWeek(date);
    return activity.activeDays.includes(currentDay);
  }
  
  // Default to showing every day for any unexpected value
  return true;
};

/**
 * Filter activities based on a given date
 * @param {Object[]} activities - Array of activity objects
 * @param {Date} date - The date to filter for
 * @returns {Object[]} - Filtered activities that should be active on the given date
 */
export const getActivitiesForDate = (activities, date) => {
  return activities.filter(activity => isDayActive(activity, date));
};

/**
 * Get a formatted string of days an activity is active
 * @param {Object} activity - The activity object
 * @param {Function} t - Translation function
 * @returns {string} - Formatted string of active days
 */
export const getActiveDaysString = (activity, t) => {
  if (!activity.activeDays || activity.activeDays === 'all') {
    return t('activityManager.everyDay');
  }
  
  if (Array.isArray(activity.activeDays)) {
    if (activity.activeDays.length === 7) {
      return t('activityManager.everyDay');
    }
    
    // Sort days according to week order (Monday first)
    const orderedDays = getAllDays();
    const sortedActiveDays = activity.activeDays.sort((a, b) => 
      orderedDays.indexOf(a) - orderedDays.indexOf(b)
    );
    
    const dayNames = sortedActiveDays.map(day => t(`daysOfWeek.short.${day}`));
    return dayNames.join(', ');
  }
  
  return t('activityManager.everyDay');
};

/**
 * Validate activeDays property
 * @param {any} activeDays - The activeDays value to validate
 * @returns {boolean} - True if valid
 */
export const isValidActiveDays = (activeDays) => {
  if (activeDays === 'all') return true;
  
  if (Array.isArray(activeDays)) {
    const validDays = getAllDays();
    return activeDays.every(day => validDays.includes(day)) && activeDays.length > 0;
  }
  
  return false;
};

/**
 * Get default activeDays value (for new activities)
 * @returns {string} - Default value
 */
export const getDefaultActiveDays = () => {
  return 'all';
};

/**
 * Convert activeDays to a standardized format
 * @param {any} activeDays - The activeDays value to normalize
 * @returns {string|string[]} - Normalized activeDays value
 */
export const normalizeActiveDays = (activeDays) => {
  // Handle legacy activities without activeDays
  if (!activeDays) return 'all';
  
  // Handle 'all' string
  if (activeDays === 'all') return 'all';
  
  // Handle arrays
  if (Array.isArray(activeDays)) {
    const validDays = getAllDays();
    const filtered = activeDays.filter(day => validDays.includes(day));
    
    // If all days are selected, return 'all'
    if (filtered.length === 7) return 'all';
    
    // If no valid days, default to 'all'
    if (filtered.length === 0) return 'all';
    
    return filtered;
  }
  
  // Default to 'all' for any other value
  return 'all';
};