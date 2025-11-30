import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import configurations
import { initDB } from './config/database.js';
import { initMinIO } from './config/minio.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import fileRoutes from './routes/files.routes.js';
import mcqRoutes from './routes/mcq.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import paymentRoutes, { webhookRouter } from './routes/payment.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import exportRoutes from './routes/export.routes.js';

// Import middleware

import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorhandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const initializeServices = async () => {
  try {
    await initDB();
    await initMinIO();
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
};

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting - Enhanced configuration
const createRateLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: {
    success: false,
    error: message,
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: message,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(windowMs / 1000)
    });
  }
});

// Create a more sophisticated rate limiting system
const createDynamicRateLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => rateLimit({
  windowMs,
  max,
  message: {
    success: false,
    error: message,
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests to prevent abuse
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: message,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.round(windowMs / 1000)
    });
  }
});

// General API rate limiting - Very lenient for normal usage
const generalLimiter = createDynamicRateLimiter(
  15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '2000'), // 2000 requests per 15 min
  'Too many requests from this IP, please try again later.',
  false // Count all requests to prevent abuse
);

// Auth rate limiting - Moderate limits
const authLimiter = createDynamicRateLimiter(
  15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_AUTH_REQUESTS || '100'), // 100 requests per 15 min
  'Too many authentication attempts, please try again later.'
);

// Login/Signup rate limiting - Stricter but reasonable
const loginLimiter = createDynamicRateLimiter(
  15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_LOGIN_REQUESTS || '50'), // 50 requests per 15 min
  'Too many login attempts, please try again later.'
);

// Quiz rate limiting - Per minute limits to prevent rapid polling
const quizLimiter = createDynamicRateLimiter(
  1 * 60 * 1000, // 1 minute
  200, // 200 requests per minute for quiz endpoints
  'Too many quiz requests, please wait before making more requests.',
  true // Don't count successful requests
);

// File operations rate limiting
const fileLimiter = createDynamicRateLimiter(
  5 * 60 * 1000, // 5 minutes
  50, // 50 file operations per 5 minutes
  'Too many file operations, please wait before making more requests.'
);

// MCQ generation rate limiting
const mcqLimiter = createDynamicRateLimiter(
  10 * 60 * 1000, // 10 minutes
  20, // 20 MCQ generations per 10 minutes
  'Too many MCQ generation requests, please wait before making more requests.'
);

// Payment rate limiting - Very strict for security
const paymentLimiter = createDynamicRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 payment requests per 15 minutes
  'Too many payment requests, please wait before making more requests.'
);

// Apply rate limiters in order of specificity
// app.use('/api/', generalLimiter);
// app.use('/api/auth', authLimiter);
// app.use('/api/auth/login', loginLimiter);
// app.use('/api/auth/signup', loginLimiter);
// app.use('/api/quiz', quizLimiter);
// app.use('/api/files', fileLimiter);
// app.use('/api/mcq', mcqLimiter);
// app.use('/api/payment', paymentLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    service: 'SmartLearn Backend API',
    database: 'PostgreSQL',
    storage: 'MinIO'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/mcq', mcqRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/export', exportRoutes);

// Webhook routes (no authentication required)
app.use('/webhooks', webhookRouter);

// API info
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 SmartLearn AI Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    storage: 'MinIO',
    endpoints: {
      auth: '/api/auth',
      files: '/api/files',
      mcq: '/api/mcq',
      quiz: '/api/quiz',
      payment: '/api/payment',
      webhooks: '/webhooks',
      health: '/health'
    }
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server with service initialization
const startServer = async () => {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`
🎯 SmartLearn Backend Server Started!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🚀 API: http://localhost:${PORT}/api
❤️  Health: http://localhost:${PORT}/health
🗄️  Database: PostgreSQL
💾 Storage: MinIO
📅 Started: ${new Date().toISOString()}
    `);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;