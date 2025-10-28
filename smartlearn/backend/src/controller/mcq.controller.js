import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { mcqQueue } from '../config/redis';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const generateMCQ = async (req, res) => {
  try {
    const userId = req.userId;
    const { fileId, questionCount, difficulty, focusAreas } = req.body;

    // Verify file exists and belongs to user
    const file = await prisma.file.findFirst({
      where: { id: fileId, userId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if file is already processing
    const existingJob = await prisma.mCQJob.findFirst({
      where: {
        fileId,
        userId,
        status: { in: ['pending', 'processing'] }
      }
    });

    if (existingJob) {
      return res.status(409).json({
        error: 'File is already being processed',
        jobId: existingJob.id
      });
    }

    // Create job record
    const jobId = uuidv4();
    const job = await prisma.mCQJob.create({
      data: {
        id: jobId,
        userId,
        fileId,
        questionCount,
        difficulty,
        status: 'pending',
        progress: 0
      }
    });

    // Add to queue
    await mcqQueue.add('generate-mcq', {
      jobId: job.id,
      fileId,
      userId,
      questionCount,
      difficulty,
      focusAreas
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    });

    logger.info('MCQ generation job created', { jobId, fileId });

    res.status(202).json({
      jobId: job.id,
      status: job.status,
      message: 'MCQ generation started'
    });
  } catch (error) {
    logger.error('Generate MCQ error', error);
    res.status(500).json({ error: 'Failed to start MCQ generation' });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    const job = await prisma.mCQJob.findFirst({
      where: { id: jobId, userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            questionCount: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      quizId: job.quizId,
      quiz: job.quiz,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    });
  } catch (error) {
    logger.error('Get job status error', error);
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
};

export const getUserJobs = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const jobs = await prisma.mCQJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        file: {
          select: {
            filename: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json({ jobs });
  } catch (error) {
    logger.error('Get user jobs error', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};