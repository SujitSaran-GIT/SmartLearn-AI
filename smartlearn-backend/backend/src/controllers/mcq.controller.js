import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { getFileUrl } from '../config/minio.js';
import { logger } from '../utils/logger.js';
import { AppError, ConflictError, NotFoundError } from '../utils/error.js';
import { publishJob } from '../config/redis.js'

export const generateMCQ = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const userId = req.userId;
    const { fileId, questionCount, difficulty, focusAreas } = req.validatedData;

    console.log('🎯 Starting MCQ generation for file:', fileId);

    // Verify file exists and belongs to user
    const fileResult = await client.query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    const file = fileResult.rows[0];
    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Check if file is already processing
    const existingJobResult = await client.query(
      `SELECT id FROM mcq_jobs 
       WHERE file_id = $1 AND user_id = $2 AND status IN ('pending', 'processing')`,
      [fileId, userId]
    );

    if (existingJobResult.rows.length > 0) {
      throw new ConflictError('File is already being processed. Please wait for completion.');
    }

    await client.query('BEGIN');

    // Create job record
    const jobId = uuidv4();
    const jobResult = await client.query(
      `INSERT INTO mcq_jobs (id, user_id, file_id, question_count, difficulty, status, progress) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, status, progress, created_at`,
      [jobId, userId, fileId, questionCount, difficulty, 'pending', 0]
    );

    // Get file download URL for worker
    const fileUrl = await getFileUrl(file.storage_key, 3600);

    await client.query('COMMIT');

    // Prepare job data for AI worker
    const jobData = {
      jobId,
      fileId,
      userId,
      fileUrl,
      questionCount,
      difficulty,
      focusAreas: focusAreas || []
    };

    console.log('📨 Publishing job to AI worker:', jobId);

    // Publish job to Redis pub/sub instead of BullMQ queue
    const published = await publishJob('mcq_jobs', jobData);

    if (!published) {
      throw new Error('Failed to send job to AI worker');
    }

    logger.info('MCQ generation job created and published', { jobId, fileId, userId });

    // Return immediate response with polling instructions
    res.status(202).json({
      success: true,
      message: 'MCQ generation started. We are processing your request.',
      data: {
        jobId,
        status: 'pending',
        progress: 0,
        estimatedTime: '1-3 minutes',
        polling: {
          endpoint: `/api/mcq/jobs/${jobId}`,
          interval: '3000ms'
        },
        nextSteps: [
          'Your file is being processed',
          'AI is analyzing the content', 
          'Questions will be generated shortly',
          'You can check progress using the job ID'
        ]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};


export const getJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    const jobResult = await pool.query(
      `SELECT 
         mj.*,
         q.id as quiz_id,
         q.title as quiz_title,
         q.question_count as quiz_question_count,
         f.filename
       FROM mcq_jobs mj
       LEFT JOIN quizzes q ON mj.quiz_id = q.id
       LEFT JOIN files f ON mj.file_id = f.id
       WHERE mj.id = $1 AND mj.user_id = $2`,
      [jobId, userId]
    );

    const job = jobResult.rows[0];
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const responseData = {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      quizId: job.quiz_id,
      error: job.error,
      createdAt: job.created_at,
      completedAt: job.completed_at,
      file: {
        filename: job.filename
      }
    };

    if (job.quiz_id) {
      responseData.quiz = {
        id: job.quiz_id,
        title: job.quiz_title,
        questionCount: job.quiz_question_count
      };
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

export const getUserJobs = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    let whereClause = 'WHERE mj.user_id = $1';
    let params = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND mj.status = $${paramCount}`;
      params.push(status);
    }

    const jobsResult = await pool.query(
      `SELECT 
         mj.*,
         f.filename,
         f.size,
         q.id as quiz_id,
         q.title as quiz_title
       FROM mcq_jobs mj
       LEFT JOIN files f ON mj.file_id = f.id
       LEFT JOIN quizzes q ON mj.quiz_id = q.id
       ${whereClause}
       ORDER BY mj.created_at DESC 
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, Number(limit), offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM mcq_jobs mj ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        jobs: jobsResult.rows.map(job => ({
          id: job.id,
          status: job.status,
          progress: job.progress,
          question_count: job.question_count,
          difficulty: job.difficulty,
          created_at: job.created_at,
          completed_at: job.completed_at,
          file: {
            filename: job.filename,
            size: job.size
          },
          quiz: job.quiz_id ? {
            id: job.quiz_id,
            title: job.quiz_title
          } : null
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

// Worker endpoints (protected by secret)

// Worker endpoints (protected by secret)
export const updateJobProgress = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { progress, status, message } = req.body;

    console.log('📊 Received progress update:', { jobId, progress, status, message });

    // Verify worker secret
    const workerSecret = req.headers['authorization']?.replace('Bearer ', '');
    if (workerSecret !== process.env.AI_WORKER_SECRET) {
      console.error('❌ Unauthorized worker request');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const result = await pool.query(
      `UPDATE mcq_jobs 
       SET progress = $1, status = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3
       RETURNING id, progress, status`,
      [progress, status, jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    console.log('✅ Job progress updated successfully:', { jobId, progress, status });

    res.json({
      success: true,
      message: 'Progress updated',
      data: {
        jobId: result.rows[0].id,
        progress: result.rows[0].progress,
        status: result.rows[0].status
      }
    });
  } catch (error) {
    console.error('❌ Error updating job progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

export const completeJob = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { jobId } = req.params;
    const { mcqs, total_questions, text_length } = req.body;

    console.log('🎯 Completing job:', { jobId, total_questions, text_length });

    // Verify worker secret
    const workerSecret = req.headers['authorization']?.replace('Bearer ', '');
    if (workerSecret !== process.env.AI_WORKER_SECRET) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    await client.query('BEGIN');

    // Find job
    const jobResult = await client.query(
      `SELECT mj.*, f.filename, f.id as file_id, mj.user_id 
       FROM mcq_jobs mj 
       JOIN files f ON mj.file_id = f.id 
       WHERE mj.id = $1`,
      [jobId]
    );

    const job = jobResult.rows[0];
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    console.log('📝 Creating quiz for job:', jobId);

    // Create quiz
    const quizId = uuidv4();
    const quizResult = await client.query(
      `INSERT INTO quizzes (id, file_id, user_id, title, question_count, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [quizId, job.file_id, job.user_id, `Quiz - ${job.filename}`, total_questions, 'active']
    );

    // Create questions
    console.log(`📚 Creating ${mcqs.length} questions for quiz ${quizId}`);
    for (const mcq of mcqs) {
      await client.query(
        `INSERT INTO questions (id, quiz_id, question_text, options, correct_index, explanation, difficulty) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), quizId, mcq.question, JSON.stringify(mcq.options), mcq.correct_index, mcq.explanation, job.difficulty || 'medium']
      );
    }

    // Update job
    await client.query(
      `UPDATE mcq_jobs 
       SET status = 'completed', progress = 100, quiz_id = $1, completed_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [quizId, jobId]
    );

    // Update file status
    await client.query(
      `UPDATE files 
       SET status = 'completed', extracted_text = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [`Text length: ${text_length} characters`, job.file_id]
    );

    await client.query('COMMIT');

    console.log('✅ Job completed successfully:', { jobId, quizId, questions: total_questions });

    res.json({
      success: true,
      message: 'Job completed successfully',
      data: { 
        quizId,
        jobId,
        questions: total_questions
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error completing job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete job',
      message: error.message
    });
  } finally {
    client.release();
  }
};

export const failJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { error } = req.body;

    console.log('❌ Failing job:', { jobId, error });

    // Verify worker secret
    const workerSecret = req.headers['authorization']?.replace('Bearer ', '');
    if (workerSecret !== process.env.AI_WORKER_SECRET) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const result = await pool.query(
      `UPDATE mcq_jobs 
       SET status = 'failed', error = $1, completed_at = CURRENT_TIMESTAMP 
       WHERE id = $2
       RETURNING id`,
      [error, jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    console.log('✅ Job marked as failed:', jobId);

    res.json({
      success: true,
      message: 'Job marked as failed'
    });
  } catch (error) {
    console.error('❌ Error failing job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark job as failed',
      message: error.message
    });
  }
};