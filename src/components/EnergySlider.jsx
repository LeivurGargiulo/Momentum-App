import { useTranslation } from 'react-i18next';
import { Battery, BatteryCharging } from 'lucide-react';

const EnergySlider = ({ energyLevel, onEnergyChange, disabled = false }) => {
  const { t } = useTranslation();
  
  const energyLevels = [
    { value: 1, label: t('energy.veryLow'), color: 'bg-red-500', icon: Battery },
    { value: 2, label: t('energy.low'), color: 'bg-orange-500', icon: Battery },
    { value: 3, label: t('energy.medium'), color: 'bg-yellow-500', icon: Battery },
    { value: 4, label: t('energy.high'), color: 'bg-green-500', icon: BatteryCharging },
    { value: 5, label: t('energy.veryHigh'), color: 'bg-emerald-500', icon: BatteryCharging },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('energy.howIsYourEnergy')}
      </label>
      
      {/* Energy Level Buttons */}
      <div className="flex gap-2">
        {energyLevels.map((level) => {
          const Icon = level.icon;
          return (
            <button
              key={level.value}
              type="button"
              onClick={() => !disabled && onEnergyChange(level.value)}
              disabled={disabled}
              className={`
                flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                ${energyLevel === level.value 
                  ? `${level.color} text-white border-transparent shadow-md` 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              `}
            >
              <Icon className={`w-6 h-6 mb-1 ${
                energyLevel === level.value ? 'text-white' : 'text-gray-400'
              }`} />
              <span className={`text-xs font-medium ${
                energyLevel === level.value 
                  ? 'text-white' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}>
                {level.value}
              </span>
              <span className={`text-xs ${
                energyLevel === level.value 
                  ? 'text-white/90' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {level.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Energy Level Display */}
      {energyLevel && (
        <div className="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t('energy.currentLevel')}: 
          </span>
          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
            {energyLevel}/5
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({energyLevels.find(l => l.value === energyLevel)?.label})
          </span>
        </div>
      )}
    </div>
  );
};

export default EnergySlider;