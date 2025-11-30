import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { AlertCircle, TrendingUp, FileText, Zap, Crown, Star } from 'lucide-react';

interface UsageIndicatorProps {
  type?: 'quiz' | 'file' | 'compact';
  className?: string;
}

const UsageIndicator: React.FC<UsageIndicatorProps> = ({ type = 'quiz', className = '' }) => {
  const { subscription, limits, usage, isLoading, getQuizAttemptsProgress, getFileUsageProgress } = useSubscription();

  if (isLoading || !subscription || !limits || !usage) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  const getPlanIcon = () => {
    switch (subscription.planType) {
      case 'free':
        return <Zap className="w-4 h-4" />;
      case 'starter':
        return <Star className="w-4 h-4" />;
      case 'pro':
        return <TrendingUp className="w-4 h-4" />;
      case 'enterprise':
        return <Crown className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getPlanColor = () => {
    switch (subscription.planType) {
      case 'free':
        return 'text-gray-600 bg-gray-100';
      case 'starter':
        return 'text-blue-600 bg-blue-100';
      case 'pro':
        return 'text-purple-600 bg-purple-100';
      case 'enterprise':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (type === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPlanColor()}`}>
          {getPlanIcon()}
          <span className="capitalize">{subscription.planType}</span>
        </div>
        {limits.quizAttemptsPerMonth && (
          <span className="text-xs text-gray-600">
            {usage.monthlyQuizAttempts}/{limits.quizAttemptsPerMonth} quizzes
          </span>
        )}
      </div>
    );
  }

  const quizProgress = getQuizAttemptsProgress();
  const fileProgress = getFileUsageProgress();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Plan Badge */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${getPlanColor()}`}>
          {getPlanIcon()}
          <span className="capitalize">{subscription.planType} Plan</span>
          {subscription.status === 'active' && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </div>

        {!isLoading && (
          <button
            onClick={() => window.location.href = '/pricing'}
            className="text-sm text-[var(--primary-600)] hover:text-[var(--primary-700)] font-medium"
          >
            Upgrade
          </button>
        )}
      </div>

      {/* Quiz Attempts Usage */}
      {limits.quizAttemptsPerMonth && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Quiz Attempts</span>
            </div>
            <span className="text-gray-600">
              {quizProgress.used}/{quizProgress.total || '∞'}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(quizProgress.percentage)}`}
              style={{ width: `${quizProgress.percentage}%` }}
            ></div>
          </div>

          {quizProgress.percentage >= 75 && (
            <div className="flex items-center space-x-2 text-xs">
              <AlertCircle className="w-3 h-3 text-yellow-600" />
              <span className="text-yellow-600">
                {quizProgress.percentage >= 90
                  ? 'Quiz limit approaching! Upgrade for unlimited attempts.'
                  : `${quizProgress.total - quizProgress.used} attempts remaining this month.`
                }
              </span>
            </div>
          )}
        </div>
      )}

      {/* File Usage */}
      {usage.fileUploadLimit && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="font-medium">File Storage</span>
            </div>
            <span className="text-gray-600">
              {fileProgress.used}MB/{fileProgress.total || '∞'}MB
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(fileProgress.percentage)}`}
              style={{ width: `${fileProgress.percentage}%` }}
            ></div>
          </div>

          {fileProgress.percentage >= 75 && (
            <div className="flex items-center space-x-2 text-xs">
              <AlertCircle className="w-3 h-3 text-yellow-600" />
              <span className="text-yellow-600">
                {fileProgress.percentage >= 90
                  ? 'Storage limit approaching! Upgrade for more space.'
                  : `${fileProgress.total - fileProgress.used}MB remaining this month.`
                }
              </span>
            </div>
          )}
        </div>
      )}

      {/* Feature Highlights */}
      <div className="pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          {limits.canExportPDF && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>PDF Export Available</span>
            </div>
          )}
          {limits.analyticsLevel !== 'basic' && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Advanced Analytics</span>
            </div>
          )}
          {!limits.quizAttemptsPerMonth && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Unlimited Quiz Attempts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageIndicator;