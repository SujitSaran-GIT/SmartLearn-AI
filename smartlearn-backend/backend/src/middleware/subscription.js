import { SubscriptionService } from '../services/subscription.service.js';
import { hasFeatureAccess, getFileUploadSizeLimit } from '../config/subscription-limits.js';

// Middleware to check if user can attempt quiz
export const checkQuizAttemptLimit = async (req, res, next) => {
  try {
    const userId = req.userId;
    const canAttempt = await SubscriptionService.canAttemptQuiz(userId);

    if (!canAttempt.canAttempt) {
      return res.status(429).json({
        success: false,
        error: `Monthly quiz attempt limit reached (${canAttempt.monthlyLimit} attempts per month)`,
        code: 'QUIZ_LIMIT_EXCEEDED',
        data: {
          currentAttempts: canAttempt.currentAttempts,
          monthlyLimit: canAttempt.monthlyLimit,
          remainingAttempts: 0
        }
      });
    }

    req.subscriptionData = {
      remainingAttempts: canAttempt.remainingAttempts,
      monthlyLimit: canAttempt.monthlyLimit,
      currentAttempts: canAttempt.currentAttempts
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check file upload size limit and monthly file count
export const checkFileUploadLimit = async (req, res, next) => {
  try {
    const userId = req.userId;
    const subscription = await SubscriptionService.getUserSubscription(userId);
    const maxFileSize = getFileUploadSizeLimit(subscription);

    // Check file size limit
    if (req.file && req.file.size > maxFileSize) {
      const maxFileSizeMB = Math.round(maxFileSize / (1024 * 1024));
      const fileSizeMB = Math.round(req.file.size / (1024 * 1024));

      return res.status(413).json({
        success: false,
        error: `File size exceeds your plan limit. Max allowed: ${maxFileSizeMB}MB, Your file: ${fileSizeMB}MB`,
        code: 'FILE_SIZE_LIMIT_EXCEEDED',
        data: {
          maxFileSizeMB,
          fileSizeMB,
          planType: subscription.planType
        }
      });
    }

    // Check monthly file upload count limit
    const fileUploadCheck = await SubscriptionService.canUploadFile(userId);
    if (!fileUploadCheck.canUpload) {
      return res.status(429).json({
        success: false,
        error: `Monthly file upload limit reached (${fileUploadCheck.monthlyLimit} files per month)`,
        code: 'FILE_COUNT_LIMIT_EXCEEDED',
        data: {
          currentFileCount: fileUploadCheck.currentFileCount,
          monthlyLimit: fileUploadCheck.monthlyLimit,
          remainingFiles: 0,
          planType: subscription.planType
        }
      });
    }

    req.subscriptionData = {
      maxFileSize,
      planType: subscription.planType,
      fileUploadInfo: fileUploadCheck
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check feature access
export const checkFeatureAccess = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      const subscription = await SubscriptionService.getUserSubscription(userId);

      if (!hasFeatureAccess(subscription, feature)) {
        return res.status(403).json({
          success: false,
          error: `This feature requires a higher subscription plan`,
          code: 'FEATURE_NOT_AVAILABLE',
          data: {
            requiredFeature: feature,
            currentPlan: subscription.planType,
            availableFeatures: subscription.planType === 'free'
              ? ['basic_quiz', 'basic_analytics']
              : subscription.planType === 'starter'
              ? ['enhanced_quiz', 'basic_analytics', 'file_upload_10mb']
              : subscription.planType === 'pro'
              ? ['unlimited_quiz', 'advanced_analytics', 'file_upload_100mb', 'pdf_export']
              : ['unlimited_quiz', 'enterprise_analytics', 'unlimited_storage', 'pdf_export', 'api_access']
          }
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to add subscription data to request
export const addSubscriptionData = async (req, res, next) => {
  try {
    const userId = req.userId;
    const subscription = await SubscriptionService.getUserSubscription(userId);
    const stats = await SubscriptionService.getSubscriptionStats(userId);

    req.subscription = subscription;
    req.subscriptionStats = stats;

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware for history retention
export const applyHistoryRetention = async (req, res, next) => {
  try {
    const userId = req.userId;
    const subscription = await SubscriptionService.getUserSubscription(userId);

    // Clean up old records if needed
    await SubscriptionService.cleanupOldRecords(userId, subscription);

    req.subscription = subscription;
    next();
  } catch (error) {
    next(error);
  }
};