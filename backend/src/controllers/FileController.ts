// src/controllers/FileController.ts
import { Request, Response } from 'express';
import { FileService } from '../services/FileService';
import { AuthRequest } from '../middleware/auth';

export class FileController {
  private fileService = new FileService();

  async uploadFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { moduleName } = req.body;
      const userId = req.user!.userId;

      const fileRecord = await this.fileService.uploadFile(userId, file, moduleName);

      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: fileRecord.id,
          filename: fileRecord.filename,
          size: fileRecord.size,
          status: fileRecord.status,
          uploadedAt: fileRecord.uploadedAt,
        },
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }

  async getUserFiles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const files = await this.fileService.getUserFiles(userId);

      res.json({ files });
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  }

  async getFileDownloadUrl(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const userId = req.user!.userId;

      const downloadUrl = await this.fileService.getFileDownloadUrl(fileId, userId);

      res.json({ downloadUrl });
    } catch (error) {
      console.error('Get download URL error:', error);
      res.status(500).json({ error: 'Failed to generate download URL' });
    }
  }
}