import React, { ReactNode, useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import UpgradePrompt from './UpgradePrompt';
import { Lock, AlertCircle } from 'lucide-react';

interface PermissionGuardProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  upgradeMessage?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradeMessage
}) => {
  const { subscription, limits, checkPermission, isLoading } = useSubscription();
  const [showPrompt, setShowPrompt] = useState(true);

  const hasFeature = () => {
    if (isLoading) return false;

    switch (feature) {
      case 'pdf_export':
        return limits?.canExportPDF || false;
      case 'advanced_analytics':
        return limits?.analyticsLevel !== 'basic';
      case 'unlimited_quiz':
        return limits?.quizAttemptsPerMonth === null;
      case 'enterprise_features':
        return subscription?.planType === 'enterprise';
      default:
        return true;
    }
  };

  const getFeatureName = () => {
    switch (feature) {
      case 'pdf_export':
        return 'PDF Export';
      case 'advanced_analytics':
        return 'Advanced Analytics';
      case 'unlimited_quiz':
        return 'Unlimited Quiz Attempts';
      case 'enterprise_features':
        return 'Enterprise Features';
      default:
        return 'This Feature';
    }
  };

  const getMinRequiredPlan = () => {
    switch (feature) {
      case 'pdf_export':
      case 'advanced_analytics':
        return 'Pro';
      case 'enterprise_features':
        return 'Enterprise';
      case 'unlimited_quiz':
        return 'Pro';
      default:
        return 'Pro';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (hasFeature()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="space-y-4">
      {showUpgradePrompt && showPrompt && (
        <UpgradePrompt
          feature={feature}
          message={upgradeMessage}
          onDismiss={() => setShowPrompt(false)}
        />
      )}

      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-4">
          <Lock className="w-6 h-6 text-gray-600" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {getFeatureName()} Locked
        </h3>

        <p className="text-gray-600 text-center mb-4 max-w-md">
          This feature requires a {getMinRequiredPlan()} plan or higher.
          Upgrade your subscription to unlock {getFeatureName().toLowerCase()} and other premium features.
        </p>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.location.href = '/pricing'}
            className="px-4 py-2 bg-[var(--primary-600)] text-white rounded-lg hover:bg-[var(--primary-700)] transition-colors font-medium"
          >
            Upgrade Plan
          </button>

          <button
            onClick={() => setShowPrompt(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Close
          </button>
        </div>

        {subscription && (
          <div className="mt-4 text-sm text-gray-500">
            Current plan: <span className="font-medium capitalize">{subscription.planType}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionGuard;