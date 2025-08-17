// Reminders and Notifications Utility
// Handles reminder creation, scheduling, and notification delivery

// Storage key for reminders
const REMINDERS_KEY = 'momentum-reminders';

// Default reminder templates
export const getDefaultReminders = (t) => [
  {
    id: 'morning-check',
    label: t('reminders.defaultReminders.morningCheck'),
    time: '09:00',
    enabled: true,
    message: t('reminders.defaultReminders.morningCheckMessage')
  },
  {
    id: 'evening-review',
    label: t('reminders.defaultReminders.eveningReview'),
    time: '20:00',
    enabled: true,
    message: t('reminders.defaultReminders.eveningReviewMessage')
  }
];

// Load reminders from localStorage
export const loadReminders = (t) => {
  try {
    const stored = localStorage.getItem(REMINDERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Return default reminders if none exist
    return getDefaultReminders(t);
  } catch (error) {
    console.error('Error loading reminders:', error);
    return getDefaultReminders(t);
  }
};

// Save reminders to localStorage
export const saveReminders = (reminders) => {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    return true;
  } catch (error) {
    console.error('Error saving reminders:', error);
    return false;
  }
};

// Create a new reminder
export const createReminder = (label, time, message = '', t) => {
  const reminders = loadReminders(t);
  const newReminder = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    label,
    time,
    enabled: true,
    message: message || t('reminders.defaultMessage', { label })
  };
  
  const updatedReminders = [...reminders, newReminder];
  saveReminders(updatedReminders);
  return newReminder;
};

// Update an existing reminder
export const updateReminder = (id, updates, t) => {
  const reminders = loadReminders(t);
  const updatedReminders = reminders.map(reminder => 
    reminder.id === id ? { ...reminder, ...updates } : reminder
  );
  saveReminders(updatedReminders);
  return updatedReminders.find(r => r.id === id);
};

// Delete a reminder
export const deleteReminder = (id, t) => {
  const reminders = loadReminders(t);
  const updatedReminders = reminders.filter(reminder => reminder.id !== id);
  saveReminders(updatedReminders);
  return true;
};

// Toggle reminder enabled/disabled
export const toggleReminder = (id, t) => {
  const reminders = loadReminders(t);
  const updatedReminders = reminders.map(reminder => 
    reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
  );
  saveReminders(updatedReminders);
  return updatedReminders.find(r => r.id === id);
};

// Check if notifications are supported
export const isNotificationsSupported = () => {
  return 'Notification' in window;
};

// Check notification permission status
export const getNotificationPermission = () => {
  if (!isNotificationsSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!isNotificationsSupported()) {
    throw new Error('Notifications are not supported in this browser');
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    throw error;
  }
};

// Send a notification
export const sendNotification = (title, options = {}) => {
  if (!isNotificationsSupported()) {
    console.warn('Notifications not supported');
    return false;
  }
  
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }
  
  try {
    const notification = new Notification(title, {
      icon: '/pwa-icon.svg',
      badge: '/pwa-icon.svg',
      requireInteraction: false,
      silent: false,
      ...options
    });
    
    // Auto-close notification after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Calculate time until next reminder
export const getTimeUntilReminder = (reminderTime) => {
  const now = new Date();
  const [hours, minutes] = reminderTime.split(':').map(Number);
  
  // Create target time for today
  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);
  
  // If the time has already passed today, schedule for tomorrow
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1);
  }
  
  return targetTime.getTime() - now.getTime();
};

// Check if a reminder should fire now
export const shouldFireReminder = (reminder) => {
  if (!reminder.enabled) return false;
  
  const now = new Date();
  const [hours, minutes] = reminder.time.split(':').map(Number);
  
  // Check if current time matches reminder time (within 1 minute)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  return Math.abs(currentHour - hours) === 0 && Math.abs(currentMinute - minutes) <= 1;
};

// Get upcoming reminders for today
export const getUpcomingReminders = (t) => {
  const reminders = loadReminders(t);
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  return reminders
    .filter(reminder => reminder.enabled)
    .map(reminder => {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const reminderMinutes = hours * 60 + minutes;
      const timeUntil = reminderMinutes - currentTime;
      
      return {
        ...reminder,
        timeUntil,
        isToday: timeUntil > 0 && timeUntil <= 24 * 60, // Within next 24 hours
        isPast: timeUntil < 0
      };
    })
    .filter(reminder => reminder.isToday)
    .sort((a, b) => a.timeUntil - b.timeUntil);
};

// Format time until reminder
export const formatTimeUntil = (minutes, t) => {
  if (minutes < 0) return t('reminders.timeFormat.pastDue');
  if (minutes < 60) return t('reminders.timeFormat.inMinutes', { minutes });
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return hours > 1 
      ? t('reminders.timeFormat.inHoursPlural', { hours })
      : t('reminders.timeFormat.inHours', { hours });
  }
  
  return t('reminders.timeFormat.inHoursMinutes', { hours, minutes: remainingMinutes });
};

// Initialize reminder scheduling
export const initializeReminders = (t) => {
  if (!isNotificationsSupported()) {
    console.warn('Notifications not supported, reminders disabled');
    return;
  }
  
  // Check for reminders every minute
  setInterval(() => {
    const reminders = loadReminders(t);
    
    reminders.forEach(reminder => {
      if (shouldFireReminder(reminder)) {
        sendNotification(reminder.label, {
          body: reminder.message,
          tag: reminder.id, // Prevent duplicate notifications
          data: { reminderId: reminder.id }
        });
      }
    });
  }, 60000); // Check every minute
};

// Validate reminder time format (HH:MM)
export const validateReminderTime = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Get reminder status for display
export const getReminderStatus = (reminder) => {
  if (!reminder.enabled) return 'disabled';
  
  const now = new Date();
  const [hours, minutes] = reminder.time.split(':').map(Number);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const reminderMinutes = hours * 60 + minutes;
  const currentMinutes = currentHour * 60 + currentMinute;
  
  if (reminderMinutes < currentMinutes) {
    return 'past';
  } else if (reminderMinutes - currentMinutes <= 60) {
    return 'upcoming';
  } else {
    return 'scheduled';
  }
};