// src/config/redis.ts
import Redis from 'ioredis';
import { ENV } from './env';

export const redis = new Redis({
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

export const initializeRedis = async (): Promise<void> => {
  try {
    await redis.ping();
    console.log('Redis connection established');
  } catch (error) {
    console.error('Redis connection failed:', error);
    process.exit(1);
  }
};