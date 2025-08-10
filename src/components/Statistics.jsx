import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Calendar, BarChart, Flame, Heart, Battery, BookOpen } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import useStore from '../store/useStore';
import ShareStats from './ShareStats';
import JournalTimeline from './JournalTimeline';

const Statistics = () => {
  const { t } = useTranslation();
  const { 
    activities, 
    getActivityStats, 
    getCompletionRate, 
    getCurrentStreak,
    getMoodStats,
    getEnergyStats,
    getMoodEnergyCorrelation,
    getJournalStats,
    setCurrentDate
  } = useStore();
  const [timeRange, setTimeRange] = useState('daily');
  const [moodEnergyTimeRange, setMoodEnergyTimeRange] = useState('week');
  const [journalTimeRange, setJournalTimeRange] = useState('month');

  const sortedActivities = activities.sort((a, b) => a.order - b.order);
  const activityStats = getActivityStats();
  const completionRate = getCompletionRate(timeRange);
  const currentStreak = getCurrentStreak();
  
  // Mood and Energy Statistics
  const moodStats = getMoodStats(moodEnergyTimeRange);
  const energyStats = getEnergyStats(moodEnergyTimeRange);
  const moodEnergyCorrelation = getMoodEnergyCorrelation();
  
  // Journal Statistics
  const journalStats = getJournalStats(journalTimeRange);

  // Prepare data for charts
  const barChartData = activityStats.map(activity => ({
    name: activity.name,
    completed: activity.count,
  }));

  const pieChartData = [
    { name: t('statistics.completed'), value: completionRate, color: '#10B981' },
    { name: t('statistics.remaining'), value: 100 - completionRate, color: '#E5E7EB' },
  ];

  const timeRangeOptions = [
    { value: 'daily', label: t('statistics.daily'), icon: Calendar },
    { value: 'weekly', label: t('statistics.weekly'), icon: BarChart },
    { value: 'monthly', label: t('statistics.monthly'), icon: TrendingUp },
  ];

  const moodEnergyTimeRangeOptions = [
    { value: 'week', label: t('statistics.week'), icon: Calendar },
    { value: 'month', label: t('statistics.month'), icon: BarChart },
    { value: 'all', label: t('statistics.allTime'), icon: TrendingUp },
  ];

  const journalTimeRangeOptions = [
    { value: 'week', label: t('statistics.week'), icon: Calendar },
    { value: 'month', label: t('statistics.month'), icon: BarChart },
    { value: 'all', label: t('statistics.allTime'), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('statistics.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('statistics.subtitle')}
          </p>
        </div>

        {/* Time Range Selector and Share Button */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('statistics.timeRange')}
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

        {/* Mood & Energy Time Range Selector */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('statistics.moodEnergyTimeRange')}
            </span>
            <div className="flex gap-2">
              {moodEnergyTimeRangeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setMoodEnergyTimeRange(option.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      moodEnergyTimeRange === option.value
                        ? 'bg-pink-600 text-white'
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
        </div>

        {/* Journal Time Range Selector */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('statistics.journalTimeRange')}
            </span>
            <div className="flex gap-2">
              {journalTimeRangeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setJournalTimeRange(option.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      journalTimeRange === option.value
                        ? 'bg-purple-600 text-white'
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
                    {timeRange} {t('statistics.average')}
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
                    {t('statistics.consecutiveDays')}
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
                    {t('statistics.configured')}
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
                    {t('statistics.topActivity')}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
              {activityStats.length > 0 ? activityStats[0].name : t('statistics.noData')}
            </div>
          </div>

          {/* Average Mood */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('statistics.averageMood')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {moodEnergyTimeRange} {t('statistics.average')}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
              {moodStats.hasData ? moodStats.averageMood.toFixed(1) : '--'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {moodStats.hasData ? t('statistics.outOf8') : t('statistics.noData')}
            </div>
          </div>

          {/* Average Energy */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                  <Battery className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('statistics.averageEnergy')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {moodEnergyTimeRange} {t('statistics.average')}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {energyStats.hasData ? energyStats.averageEnergy.toFixed(1) : '--'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {energyStats.hasData ? t('statistics.outOf5') : t('statistics.noData')}
            </div>
          </div>

          {/* Journal Consistency */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('statistics.journalConsistency')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {journalTimeRange} {t('statistics.consistency')}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {journalStats.hasData ? journalStats.stats.consistencyRate.toFixed(1) : '--'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {journalStats.hasData ? t('statistics.percent') : t('statistics.noData')}
            </div>
          </div>

          {/* Total Journal Entries */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {t('statistics.totalJournalEntries')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {journalTimeRange} {t('statistics.total')}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {journalStats.hasData ? journalStats.stats.totalEntries : '--'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {journalStats.hasData ? t('statistics.entries') : t('statistics.noData')}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Completion Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('statistics.completionRate')} {t('statistics.byActivity')}
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
              {t('statistics.overallProgress')}
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

        {/* Mood & Energy Trend Charts */}
        {(moodStats.hasData || energyStats.hasData) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Mood Trend Chart */}
            {moodStats.hasData && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  {t('statistics.moodTrend')}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodStats.moodTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis domain={[1, 8]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="moodValue" 
                      stroke="#EC4899" 
                      strokeWidth={2}
                      dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Energy Trend Chart */}
            {energyStats.hasData && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  {t('statistics.energyTrend')}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={energyStats.energyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis domain={[1, 5]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="energy" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Mood & Energy Correlation */}
        {moodEnergyCorrelation.hasData && (
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('statistics.moodEnergyCorrelation')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t('statistics.correlationDescription')}
            </p>
            <div className="space-y-3">
              {moodEnergyCorrelation.correlations.slice(0, 5).map((correlation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {correlation.activity}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {correlation.avgMood && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className="text-pink-600 dark:text-pink-400">
                          {correlation.avgMood.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {correlation.avgEnergy && (
                      <div className="flex items-center gap-1">
                        <Battery className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {correlation.avgEnergy.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <span className="text-gray-500 dark:text-gray-400">
                      ({correlation.completionCount} {t('statistics.times')})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity List */}
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('statistics.mostCompleted')} {t('statistics.activities')}
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
                      {t('statistics.times')}
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

        {/* Journal Timeline */}
        {journalStats.hasData && (
          <div className="mt-6">
            <JournalTimeline
              entries={journalStats.entries}
              onDateClick={(date) => {
                // Navigate to the selected date
                const selectedDate = new Date(date);
                setCurrentDate(selectedDate);
                // You could also add a callback to switch to the Today tab
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;