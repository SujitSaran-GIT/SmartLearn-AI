import { SubscriptionService } from '../services/subscription.service.js';

// Get user's subscription details and current usage
export const getUserSubscriptionDetails = async (req, res, next) => {
  try {
    const userId = req.userId;
    const stats = await SubscriptionService.getSubscriptionStats(userId);

    res.json({
      success: true,
      data: {
        subscription: {
          planType: stats.planType,
          status: stats.status
        },
        limits: stats.limits,
        usage: stats.usage,
        canAttemptQuiz: stats.canAttemptQuiz,
        remainingAttempts: stats.remainingAttempts
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's current usage statistics
export const getUserUsageStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const stats = await SubscriptionService.getSubscriptionStats(userId);

    // Get additional detailed usage
    const subscription = await SubscriptionService.getUserSubscription(userId);
    const retentionDate = stats.limits.historyRetentionDays ?
      new Date(Date.now() - stats.limits.historyRetentionDays * 24 * 60 * 60 * 1000) : null;

    const quizAttempts = await SubscriptionService.getQuizAttemptsWithHistoryRetention(
      userId,
      retentionDate
    );

    res.json({
      success: true,
      data: {
        subscription: {
          planType: stats.planType,
          status: stats.status
        },
        limits: stats.limits,
        usage: stats.usage,
        canAttemptQuiz: stats.canAttemptQuiz,
        remainingAttempts: stats.remainingAttempts,
        recentActivity: {
          totalQuizAttempts: quizAttempts.length,
          recentAttempts: quizAttempts.slice(0, 5).map(attempt => ({
            id: attempt.id,
            quizTitle: attempt.quiz_title,
            score: Math.round(parseFloat(attempt.score)),
            submittedAt: attempt.submitted_at
          }))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Check if user can perform specific actions
export const checkUserPermissions = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { action } = req.query;

    const subscription = await SubscriptionService.getUserSubscription(userId);
    const stats = await SubscriptionService.getSubscriptionStats(userId);

    let canPerform = false;
    let message = '';

    switch (action) {
      case 'attempt_quiz':
        canPerform = stats.canAttemptQuiz;
        message = canPerform ? 'Quiz attempt allowed' : 'Monthly quiz limit reached';
        break;
      case 'upload_file':
        canPerform = true; // File size check happens in upload middleware
        message = 'File upload allowed';
        break;
      case 'export_pdf':
        canPerform = stats.limits.canExportPDF;
        message = canPerform ? 'PDF export allowed' : 'PDF export requires Pro plan or higher';
        break;
      case 'advanced_analytics':
        canPerform = stats.limits.analyticsLevel !== 'basic';
        message = canPerform ? 'Advanced analytics available' : 'Advanced analytics requires Pro plan or higher';
        break;
      case 'enterprise_features':
        canPerform = subscription.planType === 'enterprise';
        message = canPerform ? 'Enterprise features available' : 'Enterprise features require Enterprise plan';
        break;
      default:
        canPerform = false;
        message = 'Unknown action';
    }

    res.json({
      success: true,
      data: {
        action,
        canPerform,
        message,
        planType: subscription.planType,
        upgradeRequired: !canPerform && subscription.planType !== 'enterprise'
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUserSubscriptionDetails,
  getUserUsageStats,
  checkUserPermissions
};