// src/controllers/QuizController.ts
import { Request, Response } from 'express';
import { QuizService } from '../services/QuizService';
import { AuthRequest } from '../middleware/auth';

export class QuizController {
  private quizService = new QuizService();

  async generateMCQs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fileId, questionCount, prompt } = req.body;
      const userId = req.user!.userId;

      const quiz = await this.quizService.generateMCQs(
        userId,
        fileId,
        questionCount,
        prompt
      );

      res.status(202).json({
        message: 'MCQ generation started',
        quiz: {
          id: quiz.id,
          title: quiz.title,
          questionCount: quiz.questionCount,
          status: quiz.status,
          createdAt: quiz.createdAt,
        },
      });
    } catch (error: any) {
      console.error('MCQ generation error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getQuiz(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { quizId } = req.params;
      const userId = req.user!.userId;

      const quiz = await this.quizService.getQuizById(quizId, userId);
      if (!quiz) {
        res.status(404).json({ error: 'Quiz not found' });
        return;
      }

      res.json({ quiz });
    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({ error: 'Failed to fetch quiz' });
    }
  }

  async startQuizAttempt(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { quizId } = req.params;
      const userId = req.user!.userId;

      const attempt = await this.quizService.createQuizAttempt(quizId, userId);

      res.status(201).json({
        message: 'Quiz attempt started',
        attempt: {
          id: attempt.id,
          quizId: attempt.quizId,
          status: attempt.status,
          startedAt: attempt.startedAt,
        },
      });
    } catch (error: any) {
      console.error('Start quiz error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async submitQuizAttempt(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { attemptId } = req.params;
      const { answers } = req.body;
      const userId = req.user!.userId;

      const attempt = await this.quizService.submitQuizAttempt(
        attemptId,
        userId,
        answers
      );

      res.json({
        message: 'Quiz submitted successfully',
        result: {
          id: attempt.id,
          score: attempt.percentage,
          correctCount: attempt.correctCount,
          wrongCount: attempt.wrongCount,
          submittedAt: attempt.submittedAt,
        },
      });
    } catch (error: any) {
      console.error('Submit quiz error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getQuizAttempts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const attempts = await this.quizService.getQuizAttempts(userId);

      res.json({ attempts });
    } catch (error) {
      console.error('Get attempts error:', error);
      res.status(500).json({ error: 'Failed to fetch attempts' });
    }
  }

  async getAttemptDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { attemptId } = req.params;
      const userId = req.user!.userId;

      const attempt = await this.quizService.getAttemptWithDetails(attemptId, userId);
      if (!attempt) {
        res.status(404).json({ error: 'Attempt not found' });
        return;
      }

      res.json({ attempt });
    } catch (error) {
      console.error('Get attempt details error:', error);
      res.status(500).json({ error: 'Failed to fetch attempt details' });
    }
  }
}