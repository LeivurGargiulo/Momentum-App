import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Calendar, Target } from 'lucide-react';
import useStore from '../store/useStore';
import { strings } from '../strings';

const Statistics = () => {
  const { activities, dailyData, getCompletionRate, getActivityStats } = useStore();
  const [timeframe, setTimeframe] = useState('daily');

  const stats = useMemo(() => {
    const activityStats = getActivityStats();
    const completionRate = getCompletionRate(timeframe);
    
    // Calculate total days with data
    const totalDays = Object.keys(dailyData).length;
    
    // Calculate average activities per day
    const totalCompleted = Object.values(dailyData).reduce((sum, data) => sum + data.completed.length, 0);
    const avgActivitiesPerDay = totalDays > 0 ? (totalCompleted / totalDays).toFixed(1) : 0;
    
    // Prepare chart data
    const chartData = activityStats.slice(0, 5).map(activity => ({
      name: activity.name,
      completed: activity.count,
    }));
    
    // Prepare pie chart data for completion rate
    const pieData = [
      { name: 'Completed', value: completionRate, color: '#3B82F6' },
      { name: 'Remaining', value: 100 - completionRate, color: '#E5E7EB' }
    ];
    
    return {
      completionRate,
      totalDays,
      avgActivitiesPerDay,
      activityStats,
      chartData,
      pieData
    };
  }, [activities, dailyData, timeframe, getCompletionRate, getActivityStats]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (activities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="card p-6 text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Data Available
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Start tracking your activities to see statistics here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {strings.stats}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your progress and patterns
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="card p-4 mb-6">
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {strings[period]}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-4 text-center">
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.completionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {strings.completionRate}
            </div>
          </div>
          
          <div className="card p-4 text-center">
            <Calendar className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalDays}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Days Tracked
            </div>
          </div>
        </div>

        {/* Completion Rate Chart */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {strings.completionRate}
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.completionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Overall completion rate
            </div>
          </div>
        </div>

        {/* Most Completed Activities */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            {strings.mostCompleted}
          </h2>
          
          {stats.activityStats.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              {strings.noData}
            </p>
          ) : (
            <div className="space-y-3">
              {stats.activityStats.slice(0, 5).map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-400 text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-900 dark:text-white">
                      {activity.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {activity.count}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      times
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Completion Chart */}
        {stats.chartData.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Activity Completion
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                    stroke="#6B7280"
                  />
                  <YAxis fontSize={12} stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;