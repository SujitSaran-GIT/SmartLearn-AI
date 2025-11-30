import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiService } from '../services/api';

interface SubscriptionLimits {
  quizAttemptsPerMonth: number | null;
  fileUploadSizeMB: number | null;
  historyRetentionDays: number | null;
  analyticsLevel: string;
  canExportPDF: boolean;
  features: string[];
}

interface SubscriptionUsage {
  monthlyQuizAttempts: number;
  monthlyFileUsage: number;
  fileUploadLimit: number | null;
}

interface Subscription {
  planType: string;
  status: string;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  limits: SubscriptionLimits | null;
  usage: SubscriptionUsage | null;
  canAttemptQuiz: boolean;
  remainingAttempts: number | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  checkPermission: (action: string) => Promise<boolean>;
  formatFileSizeLimit: () => string;
  getQuizAttemptsProgress: () => { used: number; total: number | null; percentage: number };
  getFileUsageProgress: () => { used: number; total: number | null; percentage: number };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [canAttemptQuiz, setCanAttemptQuiz] = useState(true);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getUserSubscriptionDetails();

      if (response.success) {
        setSubscription(response.data.subscription);
        setLimits(response.data.limits);
        setUsage(response.data.usage);
        setCanAttemptQuiz(response.data.canAttemptQuiz);
        setRemainingAttempts(response.data.remainingAttempts);
      } else {
        throw new Error('Failed to fetch subscription details');
      }
    } catch (err) {
      console.error('Subscription fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');

      // Set default values for free users on error
      setSubscription({
        planType: 'free',
        status: 'active'
      });
      setLimits({
        quizAttemptsPerMonth: 3,
        fileUploadSizeMB: 5,
        historyRetentionDays: 3,
        analyticsLevel: 'basic',
        canExportPDF: false,
        features: ['basic_quiz', 'basic_analytics']
      });
      setUsage({
        monthlyQuizAttempts: 0,
        monthlyFileUsage: 0,
        fileUploadLimit: 5
      });
      setCanAttemptQuiz(true);
      setRemainingAttempts(3);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermission = async (action: string): Promise<boolean> => {
    try {
      const response = await apiService.checkUserPermissions(action);
      return response.success && response.data.canPerform;
    } catch (err) {
      console.error('Permission check error:', err);
      return false;
    }
  };

  const formatFileSizeLimit = (): string => {
    if (!limits?.fileUploadSizeMB) return 'Unlimited';
    if (limits.fileUploadSizeMB >= 1024) return `${(limits.fileUploadSizeMB / 1024).toFixed(1)}GB`;
    return `${limits.fileUploadSizeMB}MB`;
  };

  const getQuizAttemptsProgress = () => {
    if (!usage || !limits) return { used: 0, total: 0, percentage: 0 };

    const used = usage.monthlyQuizAttempts;
    const total = limits.quizAttemptsPerMonth;
    const percentage = total ? (used / total) * 100 : 0;

    return { used, total, percentage: Math.min(percentage, 100) };
  };

  const getFileUsageProgress = () => {
    if (!usage || !limits) return { used: 0, total: 0, percentage: 0 };

    const used = usage.monthlyFileUsage;
    const total = usage.fileUploadLimit || limits.fileUploadSizeMB;
    const percentage = total ? (used / total) * 100 : 0;

    return { used, total, percentage: Math.min(percentage, 100) };
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  const value: SubscriptionContextType = {
    subscription,
    limits,
    usage,
    canAttemptQuiz,
    remainingAttempts,
    isLoading,
    error,
    refreshSubscription,
    checkPermission,
    formatFileSizeLimit,
    getQuizAttemptsProgress,
    getFileUsageProgress,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;