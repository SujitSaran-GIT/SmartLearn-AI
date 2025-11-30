import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { checkQuizAttemptLimit, checkFeatureAccess, applyHistoryRetention } from "../middleware/subscription.js";
import { deleteQuiz, getQuiz, getQuizAnalytics, getQuizResults, getUserQuizzes, submitQuiz } from "../controllers/quiz.controller.js";
import { quizSubmissionSchema, validateRequest } from "../middleware/validate.js";


const router = Router();

router.get('/', authenticateToken, applyHistoryRetention, getUserQuizzes);
router.get('/analytics', authenticateToken, checkFeatureAccess('advanced_analytics'), getQuizAnalytics);
router.get('/:quizId', authenticateToken, getQuiz);
router.get('/:quizId/results', authenticateToken, applyHistoryRetention, getQuizResults);
router.post('/:quizId/submit', authenticateToken, checkQuizAttemptLimit, validateRequest(quizSubmissionSchema), submitQuiz);
router.delete('/:quizId', authenticateToken, deleteQuiz);

export default router