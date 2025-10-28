import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { deleteQuiz, getQuiz, getQuizAnalytics, getQuizResults, getUserQuizzes, submitQuiz } from "../controllers/quiz.controller.js";
import { quizSubmissionSchema, validateRequest } from "../middleware/validate.js";


const router = Router();

router.get('/', authenticateToken, getUserQuizzes);
router.get('/analytics', authenticateToken, getQuizAnalytics);
router.get('/:quizId', authenticateToken, getQuiz);
router.get('/:quizId/results', authenticateToken, getQuizResults);
router.post('/:quizId/submit', authenticateToken, validateRequest(quizSubmissionSchema), submitQuiz);
router.delete('/:quizId', authenticateToken, deleteQuiz);

export default router