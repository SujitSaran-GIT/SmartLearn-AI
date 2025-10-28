import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database';
import { supabaseStorage } from '../config/supabase';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.userId;
    const file = req.file;
    const fileId = uuidv4();
    const storageKey = `${userId}/${fileId}-${file.originalname}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseStorage.upload(
      storageKey,
      file.buffer,
      {
        contentType: file.mimetype,
        upsert: false
      }
    );

    if (uploadError) {
      logger.error('Supabase upload error', uploadError);
      return res.status(500).json({ error: 'File upload failed' });
    }

    // Create file record in database
    const fileRecord = await prisma.file.create({
      data: {
        id: fileId,
        userId,
        filename: file.originalname,
        storageKey,
        mimeType: file.mimetype,
        size: file.size,
        status: 'uploaded'
      }
    });

    logger.info('File uploaded', { fileId, userId });

    res.status(201).json({
      fileId: fileRecord.id,
      filename: fileRecord.filename,
      size: fileRecord.size,
      status: fileRecord.status,
      createdAt: fileRecord.createdAt
    });
  } catch (error) {
    logger.error('Upload file error', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

export const getUserFiles = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        select: {
          id: true,
          filename: true,
          size: true,
          status: true,
          numPages: true,
          createdAt: true
        }
      }),
      prisma.file.count({ where: { userId } })
    ]);

    res.json({
      files,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Get files error', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

export const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.userId;

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    logger.error('Get file error', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
};

export const getFileDownloadUrl = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.userId;

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId }
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Generate signed URL (valid for 1 hour)
    const { data, error } = await supabaseStorage.createSignedUrl(
      file.storageKey,
      3600
    );

    if (error || !data) {
      logger.error('Generate signed URL error', error);
      return res.status(500).json({ error: 'Failed to generate download URL' });
    }

    res.json({
      downloadUrl: data.signedUrl,
      expiresIn: 3600
    });
  } catch (error) {
    logger.error('Get download URL error', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
};