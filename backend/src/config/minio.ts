// src/config/minio.ts
import { Client } from 'minio';
import { ENV } from './env';

export const minioClient = new Client({
  endPoint: ENV.MINIO_ENDPOINT,
  port: ENV.MINIO_PORT,
  useSSL: ENV.MINIO_USE_SSL,
  accessKey: ENV.MINIO_ACCESS_KEY,
  secretKey: ENV.MINIO_SECRET_KEY,
});

export const initializeMinIO = async (): Promise<void> => {
  try {
    const bucketExists = await minioClient.bucketExists(ENV.MINIO_BUCKET);
    if (!bucketExists) {
      await minioClient.makeBucket(ENV.MINIO_BUCKET, 'us-east-1');
      console.log(`Bucket ${ENV.MINIO_BUCKET} created successfully`);
    }
    console.log('MinIO connection established');
  } catch (error) {
    console.error('MinIO connection failed:', error);
    process.exit(1);
  }
};

export const generatePresignedUrl = (
  objectName: string,
  expiry: number = 24 * 60 * 60 // 24 hours
): Promise<string> => {
  return minioClient.presignedGetObject(ENV.MINIO_BUCKET, objectName, expiry);
};

export const uploadFile = async (
  file: Express.Multer.File,
  objectName: string
): Promise<void> => {
  await minioClient.putObject(
    ENV.MINIO_BUCKET,
    objectName,
    file.buffer,
    file.size,
    {
      'Content-Type': file.mimetype,
      'Original-Filename': file.originalname,
    }
  );
};