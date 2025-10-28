import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;

    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            options: true,
            // Don't include correctIndex or explanation in quiz payload
          }
        },
        file: {
          select: {
            filename: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({
      quizId: quiz.id,
      title: quiz.title,
      questionCount: quiz.questionCount,
      filename: quiz.file.filename,
      questions: quiz.questions,
      createdAt: quiz.createdAt
    });
  } catch (error) {
    logger.error('Get quiz error', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.userId;
    const { answers } = req.body;

    // Verify quiz exists and belongs to user
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Calculate score
    let correctCount = 0;
    let wrongCount = 0;

    const answerRecords = answers.map((answer) => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) {
        throw new Error(`Question ${answer.questionId} not found`);
      }

      const isCorrect = answer.selectedIndex === question.correctIndex;
      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
        isCorrect
      };
    });

    const score = (correctCount / quiz.questionCount) * 100;

    // Create attempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        id: uuidv4(),
        quizId,
        userId,
        score,
        correctCount,
        wrongCount,
        submittedAt: new Date(),
        answers: {
          create: answerRecords.map(a => ({
            id: uuidv4(),
            questionId: a.questionId,
            selectedIndex: a.selectedIndex,
            isCorrect: a.isCorrect
          }))
        }
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                questionText: true,
                options: true,
                correctIndex: true,
                explanation: true,
                sourceSnippet: true
              }
            }
          }
        }
      }
    });

    logger.info('Quiz submitted', { attemptId: attempt.id, score });

    res.json({
      resultId: attempt.id,
      score: attempt.score,
      correctCount: attempt.correctCount,
      wrongCount: attempt.wrongCount,
      totalQuestions: quiz.questionCount,
      submittedAt: attempt.submittedAt
    });
  } catch (error) {
    logger.error('Submit quiz error', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
};

export const getResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.userId;

    const attempt = await prisma.quizAttempt.findFirst({
      where: { id: resultId, userId },
      include: {
        quiz: {
          select: {
            title: true,
            file: {
              select: {
                filename: true
              }
            }
          }
        },
        answers: {
          include: {
            question: {
              select: {
                questionText: true,
                options: true,
                correctIndex: true,
                explanation: true,
                sourceSnippet: true
              }
            }
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json({
      resultId: attempt.id,
      quizTitle: attempt.quiz.title,
      filename: attempt.quiz.file.filename,
      score: attempt.score,
      correctCount: attempt.correctCount,
      wrongCount: attempt.wrongCount,
      totalQuestions: attempt.correctCount + attempt.wrongCount,
      submittedAt: attempt.submittedAt,
      answers: attempt.answers.map(a => ({
        questionText: a.question.questionText,
        options: a.question.options,
        selectedIndex: a.selectedIndex,
        correctIndex: a.question.correctIndex,
        isCorrect: a.isCorrect,
        explanation: a.question.explanation,
        sourceSnippet: a.question.sourceSnippet
      }))
    });
  } catch (error) {
    logger.error('Get result error', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
};

export const getUserResults = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [attempts, total] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          quiz: {
            select: {
              title: true,
              file: {
                select: {
                  filename: true
                }
              }
            }
          }
        }
      }),
      prisma.quizAttempt.count({ where: { userId } })
    ]);

    res.json({
      results: attempts.map(a => ({
        resultId: a.id,
        quizTitle: a.quiz.title,
        filename: a.quiz.file.filename,
        score: a.score,
        correctCount: a.correctCount,
        wrongCount: a.wrongCount,
        submittedAt: a.submittedAt
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Get user results error', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};