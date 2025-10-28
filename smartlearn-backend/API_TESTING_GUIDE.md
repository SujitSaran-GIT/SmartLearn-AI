# SmartLearn Backend API Testing Guide

## Overview

This document provides comprehensive testing instructions for the SmartLearn Backend API. The API is built with Express.js, uses PostgreSQL for data storage, MinIO for file storage, and Redis for job queuing.

**Base URL:** `http://localhost:3000/api`

## Authentication

### Headers
- **Authorization:** `Bearer <access_token>` (for user endpoints)
- **Authorization:** `Bearer <AI_WORKER_SECRET>` (for worker endpoints)

### User Authentication Flow
1. POST `/api/auth/signup` - Register new user
2. POST `/api/auth/login` - Get access and refresh tokens
3. POST `/api/auth/refresh` - Refresh access token when expired
4. GET `/api/auth/me` - Get current user profile (requires valid access token)

## API Endpoints

### 1. Authentication Routes

#### POST `/api/auth/signup`
Register a new user account.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "created_at": "2025-10-25T13:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

#### POST `/api/auth/login`
Authenticate and get tokens.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

#### POST `/api/auth/refresh`
Refresh access token using refresh token.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### GET `/api/auth/me`
Get current user profile. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "created_at": "2025-10-25T13:00:00.000Z",
      "last_login": "2025-10-25T13:00:00.000Z"
    }
  }
}
```

### 2. File Management Routes

#### POST `/api/files/upload`
Upload a file for MCQ generation. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
```
file: <PDF or DOCX file>
```

**Response (201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "file": {
      "id": "uuid",
      "filename": "document.pdf",
      "size": 1024000,
      "status": "uploaded",
      "created_at": "2025-10-25T13:00:00.000Z"
    }
  }
}
```

#### GET `/api/files`
Get user's uploaded files. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional: uploaded, processing, completed)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "uuid",
        "filename": "document.pdf",
        "size": 1024000,
        "status": "completed",
        "num_pages": 10,
        "mime_type": "application/pdf",
        "created_at": "2025-10-25T13:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### GET `/api/files/:fileId`
Get specific file details. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "uuid",
      "filename": "document.pdf",
      "size": 1024000,
      "status": "completed",
      "storage_key": "user-id/uuid-document.pdf",
      "mime_type": "application/pdf",
      "created_at": "2025-10-25T13:00:00.000Z"
    }
  }
}
```

#### GET `/api/files/:fileId/download`
Get file download URL. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://minio.example.com/bucket/path?signature=...",
    "expiresIn": 3600,
    "filename": "document.pdf"
  }
}
```

#### DELETE `/api/files/:fileId`
Delete a file. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### 3. MCQ Generation Routes

#### POST `/api/mcq/generate`
Start MCQ generation from uploaded file. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "fileId": "uuid-of-uploaded-file",
  "questionCount": 10,
  "difficulty": "medium",
  "focusAreas": ["topic1", "topic2"]
}
```

**Validation Rules:**
- `fileId`: Required UUID
- `questionCount`: 1-50
- `difficulty`: "easy", "medium", or "hard"
- `focusAreas`: Optional array of strings (max 5)

**Response (202):**
```json
{
  "success": true,
  "message": "MCQ generation started. We are processing your request.",
  "data": {
    "jobId": "uuid",
    "status": "pending",
    "progress": 0,
    "estimatedTime": "1-3 minutes",
    "polling": {
      "endpoint": "/api/mcq/jobs/uuid",
      "interval": "3000ms"
    },
    "nextSteps": [
      "Your file is being processed",
      "AI is analyzing the content",
      "Questions will be generated shortly",
      "You can check progress using the job ID"
    ]
  }
}
```

#### GET `/api/mcq/jobs`
Get user's MCQ generation jobs. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional: pending, processing, completed, failed)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "status": "completed",
        "progress": 100,
        "question_count": 10,
        "difficulty": "medium",
        "created_at": "2025-10-25T13:00:00.000Z",
        "completed_at": "2025-10-25T13:02:00.000Z",
        "file": {
          "filename": "document.pdf",
          "size": 1024000
        },
        "quiz": {
          "id": "uuid",
          "title": "Quiz - document.pdf"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### GET `/api/mcq/jobs/:jobId`
Get specific job status. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "completed",
    "progress": 100,
    "quizId": "uuid",
    "error": null,
    "createdAt": "2025-10-25T13:00:00.000Z",
    "completedAt": "2025-10-25T13:02:00.000Z",
    "file": {
      "filename": "document.pdf"
    },
    "quiz": {
      "id": "uuid",
      "title": "Quiz - document.pdf",
      "questionCount": 10
    }
  }
}
```

### 4. Worker Routes (Internal)

#### PATCH `/api/mcq/jobs/:jobId/progress`
Update job progress. Used by AI worker internally.

**Headers:**
```
Authorization: Bearer <AI_WORKER_SECRET>
Content-Type: application/json
```

**Body:**
```json
{
  "progress": 50,
  "status": "processing",
  "message": "Processing content"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Progress updated",
  "data": {
    "jobId": "uuid",
    "progress": 50,
    "status": "processing"
  }
}
```

#### POST `/api/mcq/jobs/:jobId/complete`
Complete job with generated MCQs. Used by AI worker internally.

**Headers:**
```
Authorization: Bearer <AI_WORKER_SECRET>
Content-Type: application/json
```

**Body:**
```json
{
  "mcqs": [
    {
      "question": "What is the capital of France?",
      "options": ["London", "Paris", "Berlin", "Madrid"],
      "correct_index": 1,
      "explanation": "Paris is the capital and most populous city of France."
    }
  ],
  "total_questions": 10,
  "text_length": 5000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Job completed successfully",
  "data": {
    "quizId": "uuid",
    "jobId": "uuid",
    "questions": 10
  }
}
```

#### POST `/api/mcq/jobs/:jobId/fail`
Mark job as failed. Used by AI worker internally.

**Headers:**
```
Authorization: Bearer <AI_WORKER_SECRET>
Content-Type: application/json
```

**Body:**
```json
{
  "error": "Failed to process file content"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Job marked as failed"
}
```

### 5. Quiz Routes

#### GET `/api/quiz`
Get user's quizzes. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "quizzes": [
      {
        "id": "uuid",
        "title": "Quiz - document.pdf",
        "question_count": 10,
        "status": "active",
        "created_at": "2025-10-25T13:02:00.000Z"
      }
    ]
  }
}
```

#### GET `/api/quiz/analytics`
Get quiz analytics. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalQuizzes": 5,
    "totalQuestions": 50,
    "completedAttempts": 3,
    "averageScores": [
      {
        "difficulty": "medium",
        "averageScore": 75.5
      }
    ],
    "recentActivity": [
      {
        "date": "2025-10-25",
        "attempts": 2
      }
    ]
  }
}
```

#### GET `/api/quiz/:quizId`
Get quiz details and questions. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "uuid",
      "title": "Quiz - document.pdf",
      "question_count": 10,
      "status": "active",
      "questions": [
        {
          "id": "uuid",
          "question_text": "What is the capital of France?",
          "options": ["London", "Paris", "Berlin", "Madrid"],
          "correct_index": 1,
          "explanation": "Paris is the capital and most populous city of France.",
          "difficulty": "medium"
        }
      ]
    }
  }
}
```

#### GET `/api/quiz/:quizId/results`
Get quiz results/attempts. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "quiz_id": "uuid",
        "score": 8,
        "total_questions": 10,
        "percentage": 80.0,
        "answers": [
          {
            "question_id": "uuid",
            "question_text": "What is the capital of France?",
            "selected_option": 1,
            "correct_option": 1,
            "is_correct": true
          }
        ],
        "attempted_at": "2025-10-25T14:00:00.000Z"
      }
    ]
  }
}
```

#### POST `/api/quiz/:quizId/submit`
Submit quiz answers. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "answers": [
    {
      "questionId": "uuid-1",
      "selectedIndex": 1
    },
    {
      "questionId": "uuid-2",
      "selectedIndex": 0
    }
  ]
}
```

**Validation Rules:**
- `answers`: Array with at least 1 answer
- `questionId`: Required UUID
- `selectedIndex`: 0-3

**Response (200):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "data": {
    "result": {
      "id": "uuid",
      "score": 8,
      "total_questions": 10,
      "percentage": 80.0,
      "grade": "B",
      "correct_answers": 8,
      "incorrect_answers": 2,
      "attempted_at": "2025-10-25T14:00:00.000Z"
    }
  }
}
```

#### DELETE `/api/quiz/:quizId`
Delete a quiz. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quiz deleted successfully"
}
```

### 6. Health Check

#### GET `/health`
Get service health status. No authentication required.

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2025-10-25T13:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "service": "SmartLearn Backend API",
  "database": "PostgreSQL",
  "storage": "MinIO"
}
```

### 7. API Info

#### GET `/api`
Get API information. No authentication required.

**Response (200):**
```json
{
  "message": "🚀 SmartLearn AI Backend API",
  "version": "1.0.0",
  "timestamp": "2025-10-25T13:00:00.000Z",
  "database": "PostgreSQL",
  "storage": "MinIO",
  "endpoints": {
    "auth": "/api/auth",
    "files": "/api/files",
    "mcq": "/api/mcq",
    "quiz": "/api/quiz",
    "health": "/health"
  }
}
```

## Error Handling

All endpoints follow a consistent error response format:

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Authentication Error (401/403):**
```json
{
  "success": false,
  "error": "Token expired",
  "code": "TOKEN_EXPIRED"
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "error": "File not found",
  "code": "NOT_FOUND"
}
```

**Internal Server Error (500):**
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Testing Commands

### Start the Backend Server
```bash
cd smartlearn-backend/backend
npm install
npm start
```

### Test Worker Endpoints
```bash
cd smartlearn-backend/backend
node src/test-backend-endpoints.js
```

### Start AI Worker (in separate terminal)
```bash
cd smartlearn-backend/ai-worker
pip install -r requirements.txt
python src/worker.py
```

### Start Services with Docker
```bash
cd smartlearn-backend
docker-compose up -d
```

## Environment Variables

Required variables in `.env`:
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `AI_WORKER_SECRET` - Secret for worker authentication
- `DATABASE_URL` - PostgreSQL connection string
- `MINIO_*` - MinIO configuration variables
- `REDIS_*` - Redis configuration variables

## Rate Limiting

All `/api/*` endpoints have rate limiting configured at 100 requests per 15 minutes per IP.
