import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { changeLanguage, getCurrentLanguage, getAvailableLanguages } from '../i18n';

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();
  const availableLanguages = getAvailableLanguages();

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {t('settings.language')}
        </span>
      </div>
      
      <div className="flex gap-2">
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              currentLanguage === language.code
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
            }`}
          >
            {language.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;