import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Calendar, BarChart, Flame } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useStore from '../store/useStore';
import ShareStats from './ShareStats';

const Statistics = () => {
  const { t } = useTranslation();
  const { activities, dailyData, getActivityStats, getCompletionRate, getCurrentStreak } = useStore();
  const [timeRange, setTimeRange] = useState('daily');

  const sortedActivities = activities.sort((a, b) => a.order - b.order);
  const activityStats = getActivityStats();
  const completionRate = getCompletionRate(timeRange);
  const currentStreak = getCurrentStreak();

  // Prepare data for charts
  const barChartData = activityStats.map(activity => ({
    name: activity.name,
    completed: activity.count,
  }));

  const pieChartData = [
    { name: 'Completed', value: completionRate, color: '#10B981' },
    { name: 'Remaining', value: 100 - completionRate, color: '#E5E7EB' },
  ];

  const timeRangeOptions = [
    { value: 'daily', label: t('statistics.daily'), icon: Calendar },
    { value: 'weekly', label: t('statistics.weekly'), icon: BarChart },
    { value: 'monthly', label: t('statistics.monthly'), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('navigation.stats')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your progress and see how you're doing
          </p>
        </div>

        {/* Time Range Selector and Share Button */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Range:
              </span>
              <div className="flex gap-2">
                {timeRangeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTimeRange(option.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        timeRange === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Share Stats Button */}
            <ShareStats timeRange={timeRange} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Completion Rate */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('statistics.completionRate')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {timeRange} average
                  </p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {completionRate.toFixed(1)}%
            </div>
          </div>

          {/* Current Streak */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('statistics.currentStreak')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Consecutive days
                  </p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {currentStreak}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentStreak === 1 ? t('statistics.day') : t('statistics.days')}
            </div>
          </div>

          {/* Total Activities */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('statistics.totalActivities')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Configured
                  </p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {sortedActivities.length}
            </div>
          </div>

          {/* Most Completed */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('statistics.mostCompleted')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Top activity
                  </p>
                </div>
              </div>
            </div>
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {activityStats.length > 0 ? activityStats[0].name : t('statistics.noData')}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Completion Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('statistics.completionRate')} by Activity
            </h3>
            {activityStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#3B82F6" />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                {t('statistics.noData')}
              </div>
            )}
          </div>

          {/* Overall Progress Pie Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Overall Progress
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('statistics.completionRate')}
              </div>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('statistics.mostCompleted')} Activities
          </h3>
          {activityStats.length > 0 ? (
            <div className="space-y-3">
              {activityStats.slice(0, 5).map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {activity.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {activity.count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      times
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('statistics.noData')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;