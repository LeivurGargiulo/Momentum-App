import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Check, ArrowRight, Globe } from 'lucide-react';
import useStore from '../store/useStore';
import { changeLanguage, getCurrentLanguage, getAvailableLanguages } from '../i18n';

const Onboarding = () => {
  const { t } = useTranslation();
  const { addActivity, setupDefaultActivities } = useStore();
  const [newActivity, setNewActivity] = useState('');
  const [activities, setActivities] = useState([]);
  const [step, setStep] = useState(0); // Start with language selection

  const handleAddActivity = () => {
    if (newActivity.trim()) {
      const activity = { id: Date.now(), name: newActivity.trim() };
      setActivities([...activities, activity]);
      setNewActivity('');
    }
  };

  const handleRemoveActivity = (id) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddActivity();
    }
  };

  const handleGetStarted = () => {
    if (activities.length > 0) {
      // Add custom activities
      activities.forEach(activity => {
        addActivity(activity.name);
      });
    } else {
      // Setup default activities
      setupDefaultActivities();
    }
  };

  const handleUseDefaults = () => {
    setupDefaultActivities();
  };

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
  };

  const currentLanguage = getCurrentLanguage();
  const availableLanguages = getAvailableLanguages();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('onboarding.welcome')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('onboarding.welcomeSubtitle')}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 0 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>

        {/* Step 0: Language Selection */}
        {step === 0 && (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('onboarding.chooseLanguage')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('onboarding.chooseLanguageDescription')}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {availableLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      currentLanguage === language.code
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{language.nativeName}</span>
                      {currentLanguage === language.code && (
                        <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
              >
                {t('onboarding.continue')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Add Activities */}
        {step === 1 && (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('onboarding.addActivity')}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('onboarding.addActivitiesDescription')}
              </p>

              {/* Add Activity Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('activityManager.activityNamePlaceholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddActivity}
                  disabled={!newActivity.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('onboarding.addActivity')}
                </button>
              </div>

              {/* Activities List */}
              {activities.length > 0 && (
                <div className="space-y-2 mb-6">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-white">{activity.name}</span>
                      <button
                        onClick={() => handleRemoveActivity(activity.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleUseDefaults}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('onboarding.useDefaults')}
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={activities.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {t('onboarding.getStarted')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('onboarding.readyToStart')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('onboarding.readyToStartDescription', { count: activities.length })}
                </p>
              </div>

              <button
                onClick={handleGetStarted}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
              >
                {t('onboarding.getStarted')}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;