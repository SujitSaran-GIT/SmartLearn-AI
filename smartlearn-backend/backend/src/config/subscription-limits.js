// Subscription limits configuration
export const SUBSCRIPTION_LIMITS = {
  free: {
    quizAttemptsPerMonth: 3,
    fileUploadSizeMB: 5,
    historyRetentionDays: 3,
    analyticsLevel: 'basic',
    canExportPDF: false,
    features: ['basic_quiz', 'basic_analytics']
  },
  starter: {
    quizAttemptsPerMonth: 10,
    fileUploadSizeMB: 10,
    historyRetentionDays: 7,
    analyticsLevel: 'basic',
    canExportPDF: false,
    features: ['enhanced_quiz', 'basic_analytics', 'file_upload_10mb']
  },
  pro: {
    quizAttemptsPerMonth: null, // unlimited
    fileUploadSizeMB: 100,
    historyRetentionDays: 30,
    analyticsLevel: 'advanced',
    canExportPDF: true,
    features: ['unlimited_quiz', 'advanced_analytics', 'file_upload_100mb', 'pdf_export']
  },
  enterprise: {
    quizAttemptsPerMonth: null, // unlimited
    fileUploadSizeMB: null, // unlimited
    historyRetentionDays: null, // unlimited
    analyticsLevel: 'enterprise',
    canExportPDF: true,
    features: ['unlimited_quiz', 'enterprise_analytics', 'unlimited_storage', 'pdf_export', 'api_access', 'bulk_management', 'advanced_security']
  }
};

// Get user's current subscription limits
export const getUserSubscriptionLimits = (subscription) => {
  if (!subscription || subscription.status !== 'active') {
    return SUBSCRIPTION_LIMITS.free;
  }

  const planType = subscription.planType || subscription.plan_type || 'free';
  return SUBSCRIPTION_LIMITS[planType] || SUBSCRIPTION_LIMITS.free;
};

// Check if user has access to a specific feature
export const hasFeatureAccess = (subscription, feature) => {
  const limits = getUserSubscriptionLimits(subscription);
  return limits.features.includes(feature);
};

// Get file upload size limit in bytes
export const getFileUploadSizeLimit = (subscription) => {
  const limits = getUserSubscriptionLimits(subscription);
  return limits.fileUploadSizeMB ? limits.fileUploadSizeMB * 1024 * 1024 : 100 * 1024 * 1024; // Default to 100MB for unlimited
};

// Get history retention date limit
export const getHistoryRetentionDate = (subscription) => {
  const limits = getUserSubscriptionLimits(subscription);
  if (!limits.historyRetentionDays) return null; // unlimited

  const date = new Date();
  date.setDate(date.getDate() - limits.historyRetentionDays);
  return date;
};