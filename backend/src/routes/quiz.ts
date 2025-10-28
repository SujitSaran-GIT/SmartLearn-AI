// src/routes/quiz.ts
import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const quizController = new QuizController();

router.post('/generate', authenticateToken, quizController.generateMCQs);
router.get('/:quizId', authenticateToken, quizController.getQuiz);
router.post('/:quizId/attempt', authenticateToken, quizController.startQuizAttempt);
router.post('/attempt/:attemptId/submit', authenticateToken, quizController.submitQuizAttempt);
router.get('/attempts/history', authenticateToken, quizController.getQuizAttempts);
router.get('/attempt/:attemptId', authenticateToken, quizController.getAttemptDetails);

export default router;