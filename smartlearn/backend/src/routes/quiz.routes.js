import { Router } from 'express';
import { 
  getQuiz, 
  submitQuiz, 
  getResult,
  getUserResults 
} from '../controllers/quiz.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, quizSubmissionSchema } from '../middleware/validate.js';

const router = Router();

router.get('/:quizId', authenticateToken, getQuiz);
router.post('/:quizId/submit', authenticateToken, validateRequest(quizSubmissionSchema), submitQuiz);
router.get('/results/:resultId', authenticateToken, getResult);
router.get('/results', authenticateToken, getUserResults);

export default router;