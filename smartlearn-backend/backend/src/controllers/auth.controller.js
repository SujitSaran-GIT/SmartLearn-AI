import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { logger } from '../utils/logger.js';
import { AppError, ValidationError, AuthenticationError, ConflictError, NotFoundError } from '../utils/error.js';

export const signup = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      throw new ValidationError('All fields are required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    if (!email.includes('@')) {
      throw new ValidationError('Invalid email format');
    }

    await client.query('BEGIN');

    // Check if user exists
    const userCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (userCheck.rows.length > 0) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (id, name, email, password_hash) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, created_at`,
      [uuidv4(), name.trim(), email.toLowerCase().trim(), passwordHash]
    );

    const user = userResult.rows[0];

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await client.query('COMMIT');
    logger.info('User registered successfully', { userId: user.id });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Signup error', error);
    throw new AppError('Failed to create account');
  } finally {
    client.release();
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password required');
    }

    // Find user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    const user = userResult.rows[0];
    
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [new Date(), user.id]
    );

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('User logged in', { userId: user.id });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Login error', error);
    throw new AppError('Login failed');
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token required');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.userId]
    );

    const user = userResult.rows[0];
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AuthenticationError('Invalid refresh token');
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT id, name, email, created_at, last_login 
       FROM users WHERE id = $1`,
      [req.userId]
    );

    const user = userResult.rows[0];
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Get user error', error);
    throw new AppError('Failed to fetch user');
  }
};