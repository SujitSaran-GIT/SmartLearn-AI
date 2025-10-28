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

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800')
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

router.post('/upload', authenticateToken, upload.single('file'), uploadFiles);
router.get('/', authenticateToken, getUserFiles);
router.get('/:fileId', authenticateToken, getFile);
router.get('/:fileId/download', authenticateToken, getFileDownloadUrl);
router.delete('/:fileId', authenticateToken, deleteFile);

export default router;