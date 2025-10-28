import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../types';
import { getQuizAnalytics } from '../redux/slices/quizSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/dashboard/StatCard';
import { Activity, ArrowUp, BarChart2, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';
import RecentQuizzes from '../components/dashboard/RecentQuizzes';
import ProgressChart from '../components/dashboard/ProgrssChart';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { analytics, loading, error } = useSelector((state: RootState) => state.quiz);
  const { user } = useSelector((state: RootState) => state.auth);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastDispatchedRef = useRef<string>('30');
  const initialLoadRef = useRef<boolean>(false);

  useEffect(() => {
    if (!initialLoadRef.current && !loading) {
      dispatch(getQuizAnalytics({ days: parseInt(timeRange) }));
      lastDispatchedRef.current = timeRange;
      initialLoadRef.current = true;
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (!loading && lastDispatchedRef.current !== timeRange) {
        dispatch(getQuizAnalytics({ days: parseInt(timeRange) }));
        lastDispatchedRef.current = timeRange;
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [dispatch, timeRange, loading]);

  if (loading && !analytics) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="text-error-500 text-lg mb-4">Error loading dashboard</div>
          <button
            onClick={() => {
              if (!loading) {
                dispatch(getQuizAnalytics({ days: parseInt(timeRange) }));
              }
            }}
            disabled={loading}
            className={`px-6 py-2 rounded-lg transition-colors ${
              loading
                ? 'bg-neutral-400 text-white cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {loading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { overview, recentQuizzes, dailyProgress } = analytics;

  if (!overview || !recentQuizzes || !dailyProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="text-text-tertiary text-lg mb-4">Loading dashboard data...</div>
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const progressData = dailyProgress.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: day.averageScore,
    attempts: day.attempts
  })).reverse();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen py-8 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-text-secondary">
            Here's your learning progress and quiz analytics
          </p>

          {/* Time Range Filter */}
          <div className="flex gap-2 mt-4">
            {[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-primary-600 text-white dark:bg-primary-500'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary border border-border-primary'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Quizzes"
              value={overview.totalQuizzes.toString()}
              icon={<FileText className="w-6 h-6" />}
              trend={{ value: 12, isPositive: true }}
              color="blue"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Attempts"
              value={overview.totalAttempts.toString()}
              icon={<Activity className="w-6 h-6" />}
              trend={{ value: 8, isPositive: true }}
              color="green"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatCard
              title="Average Score"
              value={`${overview.averageScore}%`}
              icon={<BarChart2 className="w-6 h-6" />}
              trend={{ value: 5, isPositive: overview.averageScore > 70 }}
              color="yellow"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatCard
              title="Success Rate"
              value={`${overview.successRate}%`}
              icon={<CheckCircle className="w-6 h-6" />}
              trend={{ value: 3, isPositive: overview.successRate > 75 }}
              color="orange"
            />
          </motion.div>
        </motion.div>

        {/* Charts and Recent Quizzes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Chart */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ProgressChart data={progressData} />
          </motion.div>

          {/* Recent Quizzes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <RecentQuizzes quizzes={recentQuizzes} />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <QuickAction
            title="Create New Quiz"
            description="Generate quiz from your documents"
            icon={<FileText className="w-8 h-8" />}
            action="/quizzes/create"
            color="indigo"
          />
          <QuickAction
            title="View All Quizzes"
            description="Browse your quiz library"
            icon={<BarChart2 className="w-8 h-8" />}
            action="/quizzes"
            color="green"
          />
          <QuickAction
            title="Analytics"
            description="Detailed performance insights"
            icon={<TrendingUp className="w-8 h-8" />}
            action="/analytics"
            color="purple"
          />
          <QuickAction
            title="Study Materials"
            description="Access your uploaded files"
            icon={<Clock className="w-8 h-8" />}
            action="/files"
            color="orange"
          />
        </motion.div>
      </div>
    </div>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  color: 'indigo' | 'green' | 'purple' | 'orange';
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, action, color }) => {
  const colorClasses = {
    indigo: 'bg-primary-50 text-primary-600 hover:bg-primary-100 border-primary-200 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800',
    green: 'bg-success-50 text-success-600 hover:bg-success-100 border-success-200 dark:bg-success-900/20 dark:text-success-400 dark:border-success-800',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
    orange: 'bg-warning-50 text-warning-600 hover:bg-warning-100 border-warning-200 dark:bg-warning-900/20 dark:text-warning-400 dark:border-warning-800'
  };

  return (
    <motion.a
      href={action}
      className={`block p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-md hover:scale-105 cursor-pointer ${colorClasses[color]}`}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center justify-between mb-3">
        {icon}
        <ArrowUp className="w-5 h-5 opacity-70" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </motion.a>
  );
};

export default Dashboard;