// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';


// Configuration
import { ENV } from './config/env';
import { initializeDatabase } from './config/database';
import { initializeMinIO } from './config/minio';
import { initializeRedis } from './config/redis';
import { initializeWorkers } from './config/queue';

// Routes
import authRoutes from './routes/auth'
import fileRoutes from './routes/files'
import quizRoutes from './routes/quiz'

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: ENV.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com'] 
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: ENV.RATE_LIMIT_WINDOW_MS,
      max: ENV.RATE_LIMIT_MAX_REQUESTS,
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/files', fileRoutes);
    this.app.use('/api/quiz', quizRoutes);

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: ENV.NODE_ENV 
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);

      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large' });
        }
      }

      res.status(500).json({ 
        error: 'Internal server error',
        ...(ENV.NODE_ENV === 'development' && { details: error.message })
      });
    });
  }

  public async initialize(): Promise<void> {
    try {
      await initializeDatabase();
      await initializeMinIO();
      await initializeRedis();
      initializeWorkers();

      this.app.listen(ENV.PORT, () => {
        console.log(`Server running on port ${ENV.PORT}`);
        console.log(`Environment: ${ENV.NODE_ENV}`);
      });
    } catch (error) {
      console.error('Failed to initialize application:', error);
      process.exit(1);
    }
  }
}

// Start the application
const app = new App();
app.initialize();

export default app;
