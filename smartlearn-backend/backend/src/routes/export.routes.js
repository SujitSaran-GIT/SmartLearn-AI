import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { checkFeatureAccess } from '../middleware/subscription.js';
import { exportQuizResultsToPDF } from '../controllers/export.controller.js';

const router = Router();

// All export routes require authentication
router.use(authenticateToken);

// Export quiz results to PDF (Pro+ feature)
router.get('/quiz/:quizId/pdf', checkFeatureAccess('pdf_export'), exportQuizResultsToPDF);

export default router;