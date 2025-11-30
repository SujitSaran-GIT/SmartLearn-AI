import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/error.js';
import { logger } from '../utils/logger.js';

export const getQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    const quizResult = await pool.query(
      `SELECT q.*, f.filename, f.created_at as file_created
       FROM quizzes q
       JOIN files f ON q.file_id = f.id
       WHERE q.id = $1 AND q.user_id = $2`,
      [quizId, userId]
    );

    const quiz = quizResult.rows[0];
    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    const questionsResult = await pool.query(
      `SELECT id, question_text, options, explanation, difficulty 
       FROM questions 
       WHERE quiz_id = $1 
       ORDER BY created_at`,
      [quizId]
    );

    const attemptsCountResult = await pool.query(
      'SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = $1',
      [quizId]
    );

    // Don't send correct answers to prevent cheating
    const safeQuestions = questionsResult.rows.map(q => ({
      id: q.id,
      questionText: q.question_text,
      options: q.options,
      difficulty: q.difficulty
      // Don't include explanation or correctIndex
    }));

    res.json({
      success: true,
      data: { 
        quiz: {
          ...quiz,
          questions: safeQuestions,
          _count: {
            attempts: parseInt(attemptsCountResult.rows[0].count)
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { quizId } = req.params;
    const userId = req.userId;
    const { answers } = req.body;
    const subscriptionData = req.subscriptionData;

    // Verify quiz exists and belongs to user
    const quizResult = await client.query(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [quizId, userId]
    );

    const quiz = quizResult.rows[0];
    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    // Get questions with correct answers
    const questionsResult = await client.query(
      'SELECT id, correct_index, explanation FROM questions WHERE quiz_id = $1',
      [quizId]
    );

    const questions = questionsResult.rows;
    if (!questions.length) {
      throw new ValidationError('Quiz has no questions');
    }

    await client.query('BEGIN');

    // Calculate score
    let correctCount = 0;
    const questionMap = new Map();
    
    questions.forEach(q => {
      questionMap.set(q.id, {
        correctIndex: q.correct_index,
        explanation: q.explanation
      });
    });

    const answerResults = [];
    const userAnswers = [];

    for (const answer of answers) {
      const questionData = questionMap.get(answer.questionId);
      if (!questionData) {
        throw new ValidationError(`Invalid question ID: ${answer.questionId}`);
      }

      const isCorrect = questionData.correctIndex === answer.selectedIndex;
      
      if (isCorrect) {
        correctCount++;
      }

      answerResults.push({
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
        isCorrect,
        correctIndex: questionData.correctIndex,
        explanation: questionData.explanation
      });

      userAnswers.push({
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
        isCorrect
      });
    }

    const score = (correctCount / questions.length) * 100;

    // Create attempt
    const attemptId = uuidv4();
    const attemptResult = await client.query(
      `INSERT INTO quiz_attempts (id, quiz_id, user_id, score, correct_count, wrong_count, total_count, submitted_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, submitted_at`,
      [attemptId, quizId, userId, score, correctCount, questions.length - correctCount, questions.length, new Date()]
    );

    // Create answers
    for (const answer of userAnswers) {
      await client.query(
        `INSERT INTO answers (id, attempt_id, question_id, selected_index, is_correct) 
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), attemptId, answer.questionId, answer.selectedIndex, answer.isCorrect]
      );
    }

    await client.query('COMMIT');

    logger.info('Quiz submitted', { 
      quizId, 
      userId, 
      score: score.toFixed(2),
      correctCount,
      total: questions.length
    });

    const responseData = {
      attemptId,
      score: Math.round(score),
      correctCount,
      totalCount: questions.length,
      percentage: Math.round(score),
      answers: answerResults
    };

    // Add subscription data if available
    if (subscriptionData) {
      responseData.subscriptionInfo = {
        remainingAttempts: subscriptionData.remainingAttempts,
        monthlyLimit: subscriptionData.monthlyLimit,
        currentAttempts: subscriptionData.currentAttempts + 1 // +1 for this attempt
      };
    }

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: responseData
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const getUserQuizzes = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    let whereClause = 'WHERE q.user_id = $1';
    let params = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND q.status = $${paramCount}`;
      params.push(status);
    }

    const quizzesResult = await pool.query(
      `SELECT 
         q.*,
         f.filename,
         (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
         (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempt_count,
         (SELECT score FROM quiz_attempts WHERE quiz_id = q.id ORDER BY submitted_at DESC LIMIT 1) as latest_score,
         (SELECT submitted_at FROM quiz_attempts WHERE quiz_id = q.id ORDER BY submitted_at DESC LIMIT 1) as last_attempt
       FROM quizzes q
       LEFT JOIN files f ON q.file_id = f.id
       ${whereClause}
       ORDER BY q.created_at DESC 
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, Number(limit), offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM quizzes q ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        quizzes: quizzesResult.rows.map(quiz => ({
          id: quiz.id,
          title: quiz.title,
          question_count: parseInt(quiz.question_count),
          status: quiz.status,
          created_at: quiz.created_at,
          file: {
            filename: quiz.filename
          },
          latest_score: quiz.latest_score ? Math.round(quiz.latest_score) : null,
          last_attempt: quiz.last_attempt,
          _count: {
            questions: parseInt(quiz.question_count),
            attempts: parseInt(quiz.attempt_count)
          }
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizResults = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    // First, get basic attempts data without heavy question details
    const attemptsResult = await pool.query(
      `SELECT qa.id, qa.score, qa.correct_count, qa.wrong_count, qa.total_count, qa.submitted_at
       FROM quiz_attempts qa
       WHERE qa.quiz_id = $1 AND qa.user_id = $2
       ORDER BY qa.submitted_at DESC
       LIMIT 10`, // Limit to last 10 attempts for performance
      [quizId, userId]
    );

    if (!attemptsResult.rows.length) {
      throw new NotFoundError('No attempts found for this quiz');
    }

    const quizResult = await pool.query(
      `SELECT q.*,
              (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as total_questions
       FROM quizzes q
       WHERE q.id = $1`,
      [quizId]
    );

    const quiz = quizResult.rows[0];

    // Calculate statistics
    const attempts = attemptsResult.rows;
    const bestScore = Math.max(...attempts.map(a => parseFloat(a.score)));
    const averageScore = attempts.reduce((sum, a) => sum + parseFloat(a.score), 0) / attempts.length;
    const totalAttempts = attempts.length;

    // Get detailed data for latest attempt only (optimized)
    const latestAttemptId = attempts[0].id;
    const detailedAttemptResult = await pool.query(
      `SELECT
        json_agg(
          json_build_object(
            'id', a.id,
            'question_id', a.question_id,
            'selected_index', a.selected_index,
            'is_correct', a.is_correct,
            'question', json_build_object(
              'id', q.id,
              'question_text', q.question_text,
              'options', q.options,
              'correct_index', q.correct_index,
              'explanation', q.explanation
            )
          )
        ) as answers
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.attempt_id = $1`,
      [latestAttemptId]
    );

    const latestAttemptDetails = detailedAttemptResult.rows[0]?.answers || [];

    res.json({
      success: true,
      data: {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          totalQuestions: parseInt(quiz.total_questions)
        },
        attempts: attempts.map((attempt, index) => ({
          id: attempt.id,
          score: Math.round(attempt.score),
          correct_count: attempt.correct_count,
          wrong_count: attempt.wrong_count,
          total_count: attempt.total_count,
          submitted_at: attempt.submitted_at,
          answers: index === 0 ? latestAttemptDetails : [] // Only include answers for latest attempt
        })),
        statistics: {
          bestScore: Math.round(bestScore),
          averageScore: Math.round(averageScore),
          totalAttempts,
          improvement: attempts.length > 1 ?
            Math.round(attempts[0].score - attempts[attempts.length - 1].score) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizAnalytics = async (req, res, next) => {
  try {
    const userId = req.userId;
    const subscription = req.subscription;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get user's quiz statistics
    const [totalQuizzes, totalAttempts, averageScore, recentQuizzes] = await Promise.all([
      // Total quizzes created
      pool.query('SELECT COUNT(*) FROM quizzes WHERE user_id = $1', [userId]),
      
      // Total attempts made
      pool.query(
        'SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND submitted_at >= $2',
        [userId, startDate]
      ),
      
      // Average score
      pool.query(
        'SELECT AVG(score) as avg_score FROM quiz_attempts WHERE user_id = $1 AND submitted_at >= $2',
        [userId, startDate]
      ),
      
      // Recent quizzes with attempts
      pool.query(
        `SELECT q.*,
                (SELECT score FROM quiz_attempts WHERE quiz_id = q.id ORDER BY submitted_at DESC LIMIT 1) as latest_score,
                (SELECT COUNT(*) FROM quiz_attempts WHERE quiz_id = q.id) as attempt_count
         FROM quizzes q
         WHERE q.user_id = $1
         ORDER BY q.created_at DESC
         LIMIT 5`,
        [userId]
      )
    ]);

    // Get daily progress for the last 7 days
    const dailyProgressResult = await pool.query(
      `SELECT
         DATE(submitted_at) as date,
         AVG(score) as avg_score,
         COUNT(*) as attempts
       FROM quiz_attempts
       WHERE user_id = $1 AND submitted_at >= $2
       GROUP BY DATE(submitted_at)
       ORDER BY date DESC
       LIMIT 7`,
      [userId, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]
    );

    // Determine analytics level based on subscription
    const analyticsLevel = subscription?.planType === 'enterprise' ? 'enterprise' :
                          subscription?.planType === 'pro' ? 'advanced' : 'basic';

    const baseResponse = {
      overview: {
        totalQuizzes: parseInt(totalQuizzes.rows[0].count),
        totalAttempts: parseInt(totalAttempts.rows[0].count),
        averageScore: Math.round(parseFloat(averageScore.rows[0].avg_score || 0)),
        successRate: Math.round((parseFloat(averageScore.rows[0].avg_score || 0) / 100 * 100))
      },
      recentQuizzes: recentQuizzes.rows.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        created_at: quiz.created_at,
        latest_score: quiz.latest_score ? Math.round(quiz.latest_score) : null,
        totalAttempts: parseInt(quiz.attempt_count)
      })),
      dailyProgress: dailyProgressResult.rows.map(day => ({
        date: day.date,
        averageScore: Math.round(parseFloat(day.avg_score || 0)),
        attempts: parseInt(day.attempts)
      }))
    };

    // Add advanced analytics for Pro+ users
    if (analyticsLevel !== 'basic') {
      // Get difficulty distribution
      const difficultyResult = await pool.query(
        `SELECT
           q.difficulty,
           COUNT(*) as count,
           AVG(a.is_correct::int) * 100 as accuracy_rate
         FROM questions q
         JOIN answers a ON q.id = a.question_id
         JOIN quiz_attempts qa ON a.attempt_id = qa.id
         WHERE qa.user_id = $1 AND qa.submitted_at >= $2
         GROUP BY q.difficulty`,
        [userId, startDate]
      );

      // Get performance trends
      const performanceTrendResult = await pool.query(
        `SELECT
           DATE(submitted_at) as date,
           AVG(score) as avg_score,
           COUNT(*) as attempts,
           AVG(correct_count::float / total_count * 100) as avg_accuracy
         FROM quiz_attempts
         WHERE user_id = $1 AND submitted_at >= $2
         GROUP BY DATE(submitted_at)
         ORDER BY date DESC
         LIMIT 30`,
        [userId, startDate]
      );

      baseResponse.advancedAnalytics = {
        difficultyDistribution: difficultyResult.rows.map(row => ({
          difficulty: row.difficulty,
          count: parseInt(row.count),
          accuracyRate: Math.round(parseFloat(row.accuracy_rate || 0))
        })),
        performanceTrends: performanceTrendResult.rows.map(row => ({
          date: row.date,
          averageScore: Math.round(parseFloat(row.avg_score || 0)),
          attempts: parseInt(row.attempts),
          accuracy: Math.round(parseFloat(row.avg_accuracy || 0))
        }))
      };
    }

    // Add enterprise-level analytics
    if (analyticsLevel === 'enterprise') {
      // Get detailed performance metrics
      const detailedMetricsResult = await pool.query(
        `SELECT
           DATE_PART('hour', submitted_at) as hour_of_day,
           AVG(score) as avg_score,
           COUNT(*) as attempts
         FROM quiz_attempts
         WHERE user_id = $1 AND submitted_at >= $2
         GROUP BY DATE_PART('hour', submitted_at)
         ORDER BY hour_of_day`,
        [userId, startDate]
      );

      // Get subject/topic performance (if we had categories)
      const improvementSuggestion = await pool.query(
        `SELECT
           q.difficulty,
           AVG(a.is_correct::int) * 100 as avg_accuracy,
           COUNT(*) as total_attempts
         FROM questions q
         JOIN answers a ON q.id = a.question_id
         JOIN quiz_attempts qa ON a.attempt_id = qa.id
         WHERE qa.user_id = $1 AND a.is_correct = false AND qa.submitted_at >= $2
         GROUP BY q.difficulty
         ORDER BY avg_accuracy ASC
         LIMIT 3`,
        [userId, startDate]
      );

      baseResponse.enterpriseAnalytics = {
        performanceByTimeOfDay: detailedMetricsResult.rows.map(row => ({
          hour: parseInt(row.hour_of_day),
          averageScore: Math.round(parseFloat(row.avg_score || 0)),
          attempts: parseInt(row.attempts)
        })),
        improvementAreas: improvementSuggestionResult.rows.map(row => ({
          difficulty: row.difficulty,
          accuracy: Math.round(parseFloat(row.avg_accuracy || 0)),
          totalAttempts: parseInt(row.total_attempts),
          recommendation: `Focus on ${row.difficulty} level questions to improve overall performance`
        }))
      };
    }

    res.json({
      success: true,
      data: {
        analyticsLevel,
        planType: subscription?.planType || 'free',
        ...baseResponse
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    const quizResult = await client.query(
      'SELECT * FROM quizzes WHERE id = $1 AND user_id = $2',
      [quizId, userId]
    );

    const quiz = quizResult.rows[0];
    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    await client.query('BEGIN');

    // Delete quiz (cascade will delete questions, attempts, and answers due to foreign keys)
    await client.query('DELETE FROM quizzes WHERE id = $1', [quizId]);

    await client.query('COMMIT');
    logger.info('Quiz deleted', { quizId, userId });

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
