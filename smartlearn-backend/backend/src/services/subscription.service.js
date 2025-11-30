import pool from '../config/database.js';
import { getUserSubscriptionLimits, getHistoryRetentionDate } from '../config/subscription-limits.js';

export class SubscriptionService {
  // Get user's current subscription with fallback to free tier
  static async getUserSubscription(userId) {
    try {
      const result = await pool.query(
        `SELECT * FROM subscriptions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        // Return default free subscription
        return {
          planType: 'free',
          status: 'active',
          startedAt: new Date(),
          expiresAt: null
        };
      }

      const subscription = result.rows[0];

      // Check if subscription has expired
      const now = new Date();
      if (subscription.expires_at && now > new Date(subscription.expires_at) && subscription.status === 'active') {
        // Update status to expired
        await pool.query(
          'UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['expired', subscription.id]
        );

        subscription.status = 'expired';
        return {
          planType: 'free',
          status: 'active',
          startedAt: new Date(),
          expiresAt: null
        };
      }

      return {
        id: subscription.id,
        planType: subscription.plan_type,
        billingCycle: subscription.billing_cycle,
        status: subscription.status,
        startedAt: subscription.started_at,
        expiresAt: subscription.expires_at,
        amount: subscription.amount
      };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      // Return free subscription on error
      return {
        planType: 'free',
        status: 'active',
        startedAt: new Date(),
        expiresAt: null
      };
    }
  }

  // Get user's monthly quiz attempt count
  static async getMonthlyQuizAttempts(userId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    try {
      const result = await pool.query(
        `SELECT COUNT(*) as count FROM quiz_attempts
         WHERE user_id = $1 AND submitted_at >= $2`,
        [userId, startOfMonth]
      );

      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting monthly quiz attempts:', error);
      return 0;
    }
  }

  // Check if user can attempt more quizzes this month
  static async canAttemptQuiz(userId) {
    const subscription = await this.getUserSubscription(userId);
    const limits = getUserSubscriptionLimits(subscription);

    if (limits.quizAttemptsPerMonth === null) {
      return { canAttempt: true, remainingAttempts: null };
    }

    const currentAttempts = await this.getMonthlyQuizAttempts(userId);
    const remainingAttempts = Math.max(0, limits.quizAttemptsPerMonth - currentAttempts);

    return {
      canAttempt: remainingAttempts > 0,
      remainingAttempts,
      monthlyLimit: limits.quizAttemptsPerMonth,
      currentAttempts
    };
  }

  // Get user's total file size for current month (for upload limits)
  static async getCurrentMonthFileUsage(userId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    try {
      const result = await pool.query(
        `SELECT COALESCE(SUM(size), 0) as total_size FROM files
         WHERE user_id = $1 AND created_at >= $2`,
        [userId, startOfMonth]
      );

      return parseInt(result.rows[0].total_size);
    } catch (error) {
      console.error('Error getting current month file usage:', error);
      return 0;
    }
  }

  // Get quiz attempts with history retention filter
  static async getQuizAttemptsWithHistoryRetention(userId, retentionDate) {
    try {
      let query = `
        SELECT qa.*, q.title as quiz_title, f.filename as file_filename
        FROM quiz_attempts qa
        JOIN quizzes q ON qa.quiz_id = q.id
        LEFT JOIN files f ON q.file_id = f.id
        WHERE qa.user_id = $1
      `;
      let params = [userId];

      if (retentionDate) {
        query += ` AND qa.submitted_at >= $2`;
        params.push(retentionDate);
      }

      query += ` ORDER BY qa.submitted_at DESC`;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting quiz attempts with history retention:', error);
      return [];
    }
  }

  // Clean up old records based on retention policy
  static async cleanupOldRecords(userId, subscription) {
    const retentionDate = getHistoryRetentionDate(subscription);

    if (!retentionDate) return; // No retention limit for enterprise

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete old quiz attempts and answers
      await client.query(
        `DELETE FROM quiz_attempts
         WHERE user_id = $1 AND submitted_at < $2`,
        [userId, retentionDate]
      );

      // Delete old MCQ jobs
      await client.query(
        `DELETE FROM mcq_jobs
         WHERE user_id = $1 AND created_at < $2`,
        [userId, retentionDate]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error cleaning up old records:', error);
    } finally {
      client.release();
    }
  }

  // Get subscription statistics
  static async getSubscriptionStats(userId) {
    const subscription = await this.getUserSubscription(userId);
    const limits = getUserSubscriptionLimits(subscription);
    const monthlyAttempts = await this.getMonthlyQuizAttempts(userId);
    const currentFileUsage = await this.getCurrentMonthFileUsage(userId);

    return {
      planType: subscription.planType,
      status: subscription.status,
      limits,
      usage: {
        monthlyQuizAttempts: monthlyAttempts,
        monthlyFileUsage: Math.round(currentFileUsage / (1024 * 1024)), // Convert to MB
        fileUploadLimit: limits.fileUploadSizeMB
      },
      canAttemptQuiz: limits.quizAttemptsPerMonth === null || monthlyAttempts < limits.quizAttemptsPerMonth,
      remainingAttempts: limits.quizAttemptsPerMonth ? Math.max(0, limits.quizAttemptsPerMonth - monthlyAttempts) : null
    };
  }
}

export default SubscriptionService;