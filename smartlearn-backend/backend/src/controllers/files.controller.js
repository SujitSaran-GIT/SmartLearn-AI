import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { uploadFile, getFileUrl, deleteFile as deleteMinIOFile } from '../config/minio.js';
import { logger } from '../utils/logger.js';
import { AppError, ValidationError, NotFoundError } from '../utils/error.js';

export const uploadFiles = async (req, res) => {
  const client = await pool.connect();
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const userId = req.userId;
    const file = req.file;
    
    // Validate file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '52428800');
    if (file.size > maxSize) {
      throw new ValidationError(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    const fileId = uuidv4();
    const storageKey = `${userId}/${fileId}-${file.originalname}`;

    await client.query('BEGIN');

    // Upload to MinIO
    await uploadFile(storageKey, file.buffer, file.mimetype);

    // Create file record in database
    const fileResult = await client.query(
      `INSERT INTO files (id, user_id, filename, storage_key, mime_type, size, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, filename, size, status, created_at`,
      [fileId, userId, file.originalname, storageKey, file.mimetype, file.size, 'uploaded']
    );

    await client.query('COMMIT');

    const fileRecord = fileResult.rows[0];
    logger.info('File uploaded successfully', { fileId, userId, size: file.size });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        file: fileRecord
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Upload file error', error);
    throw new AppError('Failed to upload file');
  } finally {
    client.release();
  }
};

export const getUserFiles = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    let whereClause = 'WHERE user_id = $1';
    let params = [userId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
    }

    const filesResult = await pool.query(
      `SELECT id, filename, size, status, num_pages, mime_type, created_at 
       FROM files 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, Number(limit), offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM files ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        files: filesResult.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Get files error', error);
    throw new AppError('Failed to fetch files');
  }
};

export const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.userId;

    const fileResult = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    const file = fileResult.rows[0];
    if (!file) {
      throw new NotFoundError('File not found');
    }

    res.json({
      success: true,
      data: { file }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Get file error', error);
    throw new AppError('Failed to fetch file');
  }
};

export const getFileDownloadUrl = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.userId;

    const fileResult = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    const file = fileResult.rows[0];
    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Generate signed URL (valid for 1 hour)
    const downloadUrl = await getFileUrl(file.storage_key, 3600);

    res.json({
      success: true,
      data: {
        downloadUrl,
        expiresIn: 3600,
        filename: file.filename
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Get download URL error', error);
    throw new AppError('Failed to generate download URL');
  }
};

export const deleteFile = async (req, res) => {
  const client = await pool.connect();
  try {
    const { fileId } = req.params;
    const userId = req.userId;

    await client.query('BEGIN');

    const fileResult = await client.query(
      'SELECT * FROM files WHERE id = $1 AND user_id = $2',
      [fileId, userId]
    );

    const file = fileResult.rows[0];
    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Delete from MinIO
    await deleteMinIOFile(file.storage_key);

    // Delete from database
    await client.query('DELETE FROM files WHERE id = $1', [fileId]);

    await client.query('COMMIT');
    logger.info('File deleted', { fileId, userId });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Delete file error', error);
    throw new AppError('Failed to delete file');
  } finally {
    client.release();
  }
};