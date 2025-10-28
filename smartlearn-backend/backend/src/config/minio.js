import { Client } from 'minio';
import { logger } from '../utils/logger.js';
import { configDotenv } from 'dotenv';


configDotenv()
// Validate environment variables
const requiredEnvVars = [
  'MINIO_ENDPOINT',
  'MINIO_ACCESS_KEY', 
  'MINIO_SECRET_KEY',
  'MINIO_BUCKET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

console.log('🔧 MinIO Config:', {
  endpoint: process.env.MINIO_ENDPOINT,
  port: process.env.MINIO_PORT,
  bucket: process.env.MINIO_BUCKET,
  useSSL: process.env.MINIO_USE_SSL
});

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET;

// Initialize bucket
export const initMinIO = async () => {
  try {
    console.log('🔄 Initializing MinIO connection...');
    
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      console.log(`📦 Creating bucket: ${BUCKET_NAME}`);
      await minioClient.makeBucket(BUCKET_NAME);
      console.log('✅ Bucket created successfully');
    } else {
      console.log('✅ Bucket already exists');
    }
    
    console.log('✅ MinIO initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ MinIO initialization failed:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure MinIO is running on http://localhost:9000');
      console.error('💡 Run: docker-compose up -d or start MinIO manually');
    } else if (error.code === 'AccessDenied') {
      console.error('💡 Check your MINIO_ACCESS_KEY and MINIO_SECRET_KEY');
    }
    
    throw error;
  }
};

export const uploadFile = async (objectName, buffer, mimetype) => {
  try {
    const result = await minioClient.putObject(BUCKET_NAME, objectName, buffer, {
      'Content-Type': mimetype,
    });
    return `${BUCKET_NAME}/${objectName}`;
  } catch (error) {
    logger.error('MinIO upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

export const getFileUrl = async (objectName, expiry = 24 * 60 * 60) => {
  try {
    return await minioClient.presignedGetObject(BUCKET_NAME, objectName, expiry);
  } catch (error) {
    logger.error('MinIO URL generation error:', error);
    throw new Error(`Failed to generate file URL: ${error.message}`);
  }
};

export const deleteFile = async (objectName) => {
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName);
  } catch (error) {
    logger.error('MinIO delete error:', error);
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

export const getFileStream = (objectName) => {
  return minioClient.getObject(BUCKET_NAME, objectName);
};

export default minioClient;