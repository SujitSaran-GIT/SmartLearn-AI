import { Router } from 'express';
import multer from 'multer';
import {
  uploadFiles,
  getFile,
  getUserFiles,
  getFileDownloadUrl,
  deleteFile
} from '../controllers/files.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkFileUploadLimit } from '../middleware/subscription.js';

const router = Router();

// Configure multer for memory storage with dynamic size limits
const getMulterConfig = (req, file, cb) => {
  // We'll handle size limits in the middleware after getting user subscription
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024 // Default 100MB, will be restricted further in middleware
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF and DOCX allowed.'));
      }
    }
  });

  return upload.single('file')(req, file, cb);
};

router.post('/upload', authenticateToken, (req, res, next) => {
  getMulterConfig(req, req.file, (err) => {
    if (err) return next(err);
    next();
  });
}, checkFileUploadLimit, uploadFiles);
router.get('/', authenticateToken, getUserFiles);
router.get('/:fileId', authenticateToken, getFile);
router.get('/:fileId/download', authenticateToken, getFileDownloadUrl);
router.delete('/:fileId', authenticateToken, deleteFile);

export default router;