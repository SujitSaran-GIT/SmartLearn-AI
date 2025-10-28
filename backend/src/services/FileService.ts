// src/services/FileService.ts
import { File } from '../models/File';
import { minioClient, uploadFile, generatePresignedUrl } from '../config/minio';
import { ENV } from '../config/env';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/database';

export class FileService {
  private fileRepository = AppDataSource.getRepository(File);

  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    moduleName: string
  ): Promise<File> {
    const fileId = uuidv4();
    const s3Key = `users/${userId}/files/${fileId}-${file.originalname}`;

    // Upload to MinIO
    await uploadFile(file, s3Key);

    // Create file record
    const fileRecord = this.fileRepository.create({
      id: fileId,
      userId,
      filename: file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      s3Key,
      status: 'pending',
      metadata: {
        moduleName,
        uploadDate: new Date(),
      },
    });

    await this.fileRepository.save(fileRecord);
    return fileRecord;
  }

  async getFileById(fileId: string, userId: string): Promise<File | null> {
    return this.fileRepository.findOne({
      where: { id: fileId, userId },
      relations: ['user'],
    });
  }

  async getUserFiles(userId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: { userId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async getFileDownloadUrl(fileId: string, userId: string): Promise<string> {
    const file = await this.getFileById(fileId, userId);
    if (!file) {
      throw new Error('File not found');
    }

    return generatePresignedUrl(file.s3Key);
  }

  async updateFileStatus(
    fileId: string,
    status: File['status'],
    extractedText?: string
  ): Promise<void> {
    await this.fileRepository.update(fileId, {
      status,
      extractedText,
    });
  }
}