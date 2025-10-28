import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '../components/Dashboard/StatsCard';
import { RecentTests } from '../components/Dashboard/RecentTests';
import { DashboardCharts } from '../components/Dashboard/DashboardCharts';
import { BookOpen, TrendingUp, Trophy, Target, Plus } from 'lucide-react';
import { api } from '../services/api';
import type { DashboardStats } from '../types';
import { DashboardLayout } from '../components/Shared/DashboardLayout';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await api.dashboard.getStats();
      setStats(dashboardStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTestClick = (testId: string) => {
    navigate(`/review?testId=${testId}`);
  };

  const handleViewAllTests = () => {
    navigate('/review');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800">Loading Dashboard...</h3>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md">
              <h3 className="font-semibold mb-2">Failed to Load Dashboard</h3>
              <p className="mb-4">{error}</p>
              <button 
                onClick={loadDashboardData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">No Data Available</h3>
            <p className="text-gray-600">Start by creating your first quiz!</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back! 👋</h1>
            <p className="text-gray-600">Track your progress and continue your learning journey</p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* Rest of the dashboard content remains the same */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={<BookOpen className="w-6 h-6" />}
          value={stats.totalTests}
          label="Total Tests Taken"
          color="indigo"
          badge="+2 this week"
        />
        <StatsCard
          icon={<TrendingUp className="w-6 h-6" />}
          value={`${stats.averageScore}%`}
          label="Average Score"
          color="green"
          badge="+5%"
        />
        <StatsCard
          icon={<Trophy className="w-6 h-6" />}
          value={`${stats.bestScore}%`}
          label="Best Score"
          color="purple"
        />
        <StatsCard
          icon={<Target className="w-6 h-6" />}
          value={`${stats.percentile}th`}
          label="Percentile Rank"
          color="orange"
          badge="Top 15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <DashboardCharts tests={stats.recentTests} />
        <RecentTests 
          tests={stats.recentTests}
          onViewAll={handleViewAllTests}
          onTestClick={handleTestClick}
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/upload')}
            className="p-6 text-left border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition group"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Upload New Material</h4>
            <p className="text-sm text-gray-600">Start by uploading a new learning module</p>
          </button>

          <button
            onClick={() => navigate('/generate')}
            className="p-6 text-left border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Generate MCQs</h4>
            <p className="text-sm text-gray-600">Create practice questions from uploaded files</p>
          </button>

          <button
            onClick={() => navigate('/review')}
            className="p-6 text-left border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Review Progress</h4>
            <p className="text-sm text-gray-600">See detailed analytics and insights</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};