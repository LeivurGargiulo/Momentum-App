import { Calendar, BarChart3, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navigation = ({ currentTab, onTabChange }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'today', label: t('navigation.today'), icon: Calendar },
    { id: 'stats', label: t('navigation.stats'), icon: BarChart3 },
    { id: 'settings', label: t('navigation.settings'), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;