// src/config/database.ts
import { DataSource } from 'typeorm';
import { ENV } from './env';
import { User } from '../models/User';
import { File } from '../models/File';
import { Quiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { QuizAttempt } from '../models/QuizAttempt';
import { Answer } from '../models/Answer';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  synchronize: ENV.NODE_ENV !== 'production',
  logging: ENV.NODE_ENV !== 'production',
  entities: [User, File, Quiz, Question, QuizAttempt, Answer],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};