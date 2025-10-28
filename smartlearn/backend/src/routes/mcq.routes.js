import { Router } from 'express';
import { 
  generateMCQ, 
  getJobStatus, 
  getUserJobs 
} from '../controllers/mcq.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, mcqGenerationSchema } from '../middleware/validate.js';

const router = Router();

router.post('/generate', authenticateToken, validateRequest(mcqGenerationSchema), generateMCQ);
router.get('/jobs', authenticateToken, getUserJobs);
router.get('/jobs/:jobId', authenticateToken, getJobStatus);

export default router;