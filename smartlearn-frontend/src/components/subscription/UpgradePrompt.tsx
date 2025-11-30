import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { AlertCircle, Crown, Zap, Star, TrendingUp, X, ExternalLink } from 'lucide-react';

interface UpgradePromptProps {
  feature?: string;
  message?: string;
  onDismiss?: () => void;
  compact?: boolean;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  message,
  onDismiss,
  compact = false
}) => {
  const { subscription } = useSubscription();

  const getUpgradeMessage = () => {
    if (message) return message;

    switch (feature) {
      case 'quiz_attempts':
        return 'You\'ve reached your monthly quiz limit. Upgrade to Pro for unlimited attempts!';
      case 'pdf_export':
        return 'PDF export is available for Pro plans and above. Upgrade to export your results!';
      case 'advanced_analytics':
        return 'Get detailed analytics and insights with a Pro or Enterprise plan!';
      case 'file_upload':
        return 'Need more storage? Upgrade to increase your file upload limits!';
      default:
        return 'Unlock premium features by upgrading your plan!';
    }
  };

  const getRecommendedPlan = () => {
    if (subscription?.planType === 'free') return 'starter';
    if (subscription?.planType === 'starter') return 'pro';
    if (subscription?.planType === 'pro') return 'enterprise';
    return 'pro';
  };

  const getPlanIcon = () => {
    const recommendedPlan = getRecommendedPlan();
    switch (recommendedPlan) {
      case 'starter':
        return <Star className="w-5 h-5" />;
      case 'pro':
        return <TrendingUp className="w-5 h-5" />;
      case 'enterprise':
        return <Crown className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getPlanColor = () => {
    const recommendedPlan = getRecommendedPlan();
    switch (recommendedPlan) {
      case 'starter':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'pro':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'enterprise':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${getPlanColor()}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Upgrade Required</span>
        </div>
        <button
          onClick={() => window.location.href = '/pricing'}
          className="text-sm font-medium hover:underline flex items-center space-x-1"
        >
          <span>Upgrade</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-4 bg-gradient-to-r from-[var(--bg-primary)] to-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-lg">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}

      <div className="flex items-start space-x-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${getPlanColor()}`}>
          {getPlanIcon()}
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-[var(--text-primary)]">
            Upgrade to {getRecommendedPlan().charAt(0).toUpperCase() + getRecommendedPlan().slice(1)} Plan
          </h3>

          <p className="text-[var(--text-secondary)] text-sm">
            {getUpgradeMessage()}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => window.location.href = '/pricing'}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[var(--primary-600)] text-white rounded-lg hover:bg-[var(--primary-700)] transition-colors text-sm font-medium"
            >
              <span>View Plans</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onDismiss}
              className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;