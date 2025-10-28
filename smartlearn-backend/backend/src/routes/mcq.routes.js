import { Router } from "express";
import { authenticateToken } from "../middleware/auth.js";
import { completeJob, failJob, generateMCQ, getJobStatus, getUserJobs, updateJobProgress } from "../controllers/mcq.controller.js";
import { mcqGenerationSchema, validateRequest } from "../middleware/validate.js";

const router = Router();

router.post('/generate', authenticateToken, validateRequest(mcqGenerationSchema), generateMCQ);
router.get('/jobs', authenticateToken, getUserJobs);
router.get('/jobs/:jobId', authenticateToken, getJobStatus);
router.patch('/jobs/:jobId/progress', updateJobProgress);
router.post('/jobs/:jobId/complete', completeJob);
router.post('/jobs/:jobId/fail', failJob);

export default router