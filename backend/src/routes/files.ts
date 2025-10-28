// src/routes/files.ts
import { Router } from 'express';
import multer from 'multer';
import { FileController } from '../controllers/FileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const fileController = new FileController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

router.post('/upload', authenticateToken, upload.single('file'), fileController.uploadFile);
router.get('/', authenticateToken, fileController.getUserFiles);
router.get('/:fileId/download', authenticateToken, fileController.getFileDownloadUrl);

export default router;