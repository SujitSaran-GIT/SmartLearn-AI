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

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 100 * 60 * 1000,
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// });
// app.use('/api/', limiter);

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