import { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  loadReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
  validateReminderTime,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationsSupported,
  getUpcomingReminders,
  formatTimeUntil
} from '../utils/reminders';

const Reminders = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isNotificationsSupportedState, setIsNotificationsSupportedState] = useState(true);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    label: '',
    time: '09:00',
    message: ''
  });

  // Load reminders and check notification support on mount
  useEffect(() => {
    loadRemindersData();
    
    // Check notification support
    const supported = isNotificationsSupported();
    setIsNotificationsSupportedState(supported);
    
    if (supported) {
      const permission = getNotificationPermission();
      setNotificationPermission(permission);
    }
    
    updateUpcomingReminders();
    
    // Update upcoming reminders every minute
    const interval = setInterval(updateUpcomingReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadRemindersData = () => {
    const loadedReminders = loadReminders();
    setReminders(loadedReminders);
  };



  const updateUpcomingReminders = () => {
    const upcoming = getUpcomingReminders();
    setUpcomingReminders(upcoming);
  };

  const handleRequestPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const handleAddReminder = () => {
    if (!formData.label.trim() || !validateReminderTime(formData.time)) {
      return;
    }

    createReminder(formData.label, formData.time, formData.message);
    setFormData({ label: '', time: '09:00', message: '' });
    setShowAddForm(false);
    loadRemindersData();
    updateUpcomingReminders();
  };

  const handleEditReminder = () => {
    if (!formData.label.trim() || !validateReminderTime(formData.time)) {
      return;
    }

    updateReminder(editingReminder.id, {
      label: formData.label,
      time: formData.time,
      message: formData.message
    });
    
    setFormData({ label: '', time: '09:00', message: '' });
    setEditingReminder(null);
    loadRemindersData();
    updateUpcomingReminders();
  };

  const handleDeleteReminder = (id) => {
    if (window.confirm(t('reminders.confirmDelete'))) {
      deleteReminder(id);
      loadRemindersData();
      updateUpcomingReminders();
    }
  };

  const handleToggleReminder = (id) => {
    toggleReminder(id);
    loadRemindersData();
    updateUpcomingReminders();
  };

  const handleEditClick = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      label: reminder.label,
      time: reminder.time,
      message: reminder.message
    });
  };

  const handleCancelEdit = () => {
    setEditingReminder(null);
    setFormData({ label: '', time: '09:00', message: '' });
  };

  const getPermissionStatusIcon = () => {
    switch (notificationPermission) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPermissionStatusText = () => {
    switch (notificationPermission) {
      case 'granted':
        return t('reminders.permissionGranted');
      case 'denied':
        return t('reminders.permissionDenied');
      default:
        return t('reminders.permissionDefault');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('reminders.title')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Notification Permission Status */}
          {!isNotificationsSupportedState ? (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                    {t('reminders.notificationsNotSupported')}
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    {t('reminders.notificationsNotSupportedDescription')}
                  </p>
                </div>
              </div>
            </div>
          ) : notificationPermission !== 'granted' && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                {getPermissionStatusIcon()}
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200">
                    {t('reminders.notificationPermission')}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {getPermissionStatusText()}
                  </p>
                </div>
                {notificationPermission === 'default' && (
                  <button
                    onClick={handleRequestPermission}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('reminders.enableNotifications')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          {upcomingReminders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {t('reminders.upcomingToday')}
              </h3>
              <div className="space-y-2">
                {upcomingReminders.slice(0, 3).map(reminder => (
                  <div
                    key={reminder.id}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {reminder.label}
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {reminder.time} • {formatTimeUntil(reminder.timeUntil)}
                        </p>
                      </div>
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add/Edit Form */}
          {(showAddForm || editingReminder) && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                {editingReminder ? t('reminders.editReminder') : t('reminders.addReminder')}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('reminders.label')}
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder={t('reminders.labelPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('reminders.time')}
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('reminders.message')} ({t('reminders.optional')})
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t('reminders.messagePlaceholder')}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={editingReminder ? handleEditReminder : handleAddReminder}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingReminder ? t('reminders.save') : t('reminders.add')}
                  </button>
                  <button
                    onClick={editingReminder ? handleCancelEdit : () => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {t('reminders.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reminders List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('reminders.allReminders')}
              </h3>
              {!showAddForm && !editingReminder && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('reminders.add')}
                </button>
              )}
            </div>
            
            {reminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('reminders.noReminders')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map(reminder => (
                  <div
                    key={reminder.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {reminder.label}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {reminder.time}
                          </span>
                        </div>
                        {reminder.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {reminder.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleReminder(reminder.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            reminder.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              reminder.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        
                        <button
                          onClick={() => handleEditClick(reminder)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reminder Limitations Notice */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {t('reminders.limitationsTitle')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('reminders.limitationsDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;