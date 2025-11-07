## Project Overview

Smart-Learn is an AI-powered quiz generation platform that allows users to upload documents (PDFs) and automatically generate multiple-choice questions (MCQs) using artificial intelligence. The platform provides a complete workflow from file upload through quiz generation to taking assessments.

## Project Structure

The project is organized into two main folders:

- **`smartlearn-backend/`**: Server-side components including the main API, AI workers, and containers
- **`smartlearn-frontend/`**: Client-side React application

### `smartlearn-backend/` Structure

```
smartlearn-backend/
├── API_TESTING_GUIDE.md          # Comprehensive API documentation
├── DOCKER_DEPLOYMENT_GUIDE.md    # Container deployment instructions
├── docker-compose.yml            # Multi-service container orchestration
├── docker-compose.env           # Environment variables for containers
├── init-db.sql                  # PostgreSQL initialization script
├── ai-worker/                   # Python AI processing service
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── src/
│   │   ├── worker.py            # Main AI worker logic
│   │   ├── config.py
│   │   ├── llm/                 # LLM clients (Groq, Google, OpenAI)
│   │   ├── extractors/          # Text extraction utilities
│   │   └── generators/          # MCQ generation algorithms
└── backend/                     # Node.js API server
    ├── Dockerfile
    ├── package.json
    ├── src/
    │   ├── index.js             # Server entry point
    │   ├── config/              # Database, MinIO, Redis configs
    │   ├── controllers/         # Route handlers
    │   ├── middleware/          # Auth, validation, error handling
    │   ├── routes/              # API routes
    │   └── utils/               # Helper functions
```

### `smartlearn-frontend/` Structure

```
smartlearn-frontend/
├── package.json
├── src/
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # App entry point
│   ├── components/
│   │   ├── auth/                # Login/signup components
│   │   ├── dashboard/           # Dashboard widgets (charts, stats)
│   │   ├── QuizGeneration.tsx   # MCQ generation interface
│   │   ├── Layout.tsx           # App layout with sidebar
│   │   └── ...
│   ├── pages/
│   │   ├── Dashboard.tsx        # User dashboard
│   │   ├── AttemptQuiz.tsx      # Quiz taking interface
│   │   ├── GenerateQuiz.tsx     # Quiz creation page
│   │   ├── Results.tsx          # Quiz results display
│   │   ├── History.tsx          # Quiz attempt history
│   │   ├── Leaderboard.tsx      # Performance rankings
│   │   └── ...
│   ├── redux/
│   │   ├── store.ts             # Redux store configuration
│   │   └── slices/              # State management slices
│   └── types/                   # TypeScript type definitions
```

## Technologies Used

### Backend Technologies (`smartlearn-backend`)

#### Main API Server (`backend/`)
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: MinIO (S3-compatible object storage)
- **Caching/Queuing**: Redis with BullMQ
- **Authentication**: JWT tokens with refresh token support
- **Security**: Helmet, CORS, rate limiting (express-rate-limit)
- **Validation**: Zod schemas and express-validator
- **Development**: Nodemon for hot reloading

#### Dependencies (`package.json`):
- `express`: Web framework
- `prisma`: Database ORM
- `@prisma/client`: Prisma client
- `jsonwebtoken`: JWT authentication
- `bcryptjs`: Password hashing
- `multer`: File upload handling
- `minio`: Object storage client
- `redis`: Cache/queue client
- `supabase-js`: Database connection
- `axios`: HTTP client for external APIs

#### AI Worker (`ai-worker/`)
- **Runtime**: Python with FastAPI
- **PDF Processing**: PyMuPDF (Fitz) for text extraction
- **LLM Providers**:
  - Groq (primary)
  - Google Generative AI (Gemini)
  - OpenAI (GPT)
- **Job Queue**: Redis/BullMQ for backend communication
- **Async Processing**: asyncio for concurrent operations

#### Containerization
- **Docker**: Containerized services with multi-stage builds
- **Docker Compose**: Orchestration of postgres, redis, minio, backend, and ai-worker services

### Frontend Technologies (`smartlearn-frontend`)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and building
- **State Management**: Redux Toolkit with React-Redux
- **Routing**: React Router for client-side navigation
- **Styling**: Tailwind CSS with PostCSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Linting**: ESLint with TypeScript support

#### Key Dependencies (`package.json`):
- `react` & `@types/react`: UI framework
- `@reduxjs/toolkit`: State management
- `react-router-dom`: Client routing
- `framer-motion`: Animations
- `lucide-react`: Icon library
- `tailwindcss`: Utility-first CSS

## Implemented Features

### Core Functionality

1. **User Authentication & Authorization**
   - User registration and login
   - JWT-based authentication with access/refresh tokens
   - Password hashing with bcrypt
   - Protected routes and middleware

2. **File Upload & Management**
   - PDF file uploads to MinIO storage
   - File validation (size, type)
   - File metadata tracking (name, size, pages, MIME type)
   - File download and deletion capabilities

3. **AI-Powered Quiz Generation**
   - Automatic PDF text extraction
   - Multiple LLM provider support (Groq, Google AI, OpenAI)
   - Configurable question count and difficulty levels
   - Progress tracking for long-running generation jobs
   - Question generation with multiple choice options and explanations

4. **Quiz Management**
   - Create, view, and delete quizzes
   - Quiz attempt tracking
   - Score calculation and grade assignment
   - Quiz analytics and performance metrics

5. **Interactive Quiz Taking**
   - Real-time quiz interface
   - Question navigation
   - Answer selection and submission
   - Time tracking for attempts

6. **Analytics & Reporting**
   - Personal dashboard with statistics
   - Quiz attempt history
   - Performance leaderboard
   - Average scores by difficulty
   - Recent activity tracking

### User Interface Features

- **Responsive Design**: Mobile-friendly layout
- **Dark Mode**: Theme switching capability
- **Progress Indicators**: Visual feedback for long operations
- **Data Visualization**: Charts for analytics
- **Navigation**: Sidebar navigation with breadcrumbs
- **Forms**: Validation and error handling
- **Loading States**: Skeletons and spinners

### API Architecture

- **RESTful Design**: Standard HTTP methods and status codes
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Consistent error responses
- **Pagination**: Support for large datasets
- **WebSocket Alternative**: Polling for job progress updates

### Deployment & DevOps

- **Containerized**: Docker containers for all services
- **Environment Configuration**: Flexible configuration management
- **Health Checks**: Service monitoring endpoints
- **Logging**: Structured logging throughout the application
- **Database Migrations**: Prisma-based schema management

## System Architecture

The application follows a microservices architecture:

1. **Frontend (React)**: User interface and client-side logic
2. **Backend API (Node.js)**: RESTful API server handling business logic
3. **AI Worker (Python)**: Asynchronous MCQ generation service
4. **Database (PostgreSQL)**: Persistent data storage
5. **File Storage (MinIO)**: Document storage and retrieval
6. **Cache/Queue (Redis)**: Caching and job queue management

### Data Flow

1. User uploads PDF → Backend stores in MinIO
2. User requests quiz generation → Backend creates job in Redis queue
3. AI Worker processes job → Extracts text from PDF → Generates MCQs via LLM
4. Worker returns results → Backend stores quiz in database
5. User can view, take, and track quiz performance

### Security Measures

- **Authentication**: JWT tokens with expiration
- **Authorization**: Route-level protection
- **Input Validation**: Schema validation with Zod
- **Rate Limiting**: Request throttling
- **Security Headers**: Helmet for HTTP security
- **File Validation**: Type and size restrictions
- **Password Policies**: Secure hashing and validation

## Development Setup

The project includes comprehensive deployment guides:

- **Local Development**: Individual service startup scripts
- **Docker Deployment**: Containerization for production
- **Database Setup**: Auto-initialization with SQL scripts
- **API Testing**: Complete endpoint documentation and test commands

This documentation covers the complete SmartLearn platform, built as a full-stack AI application for educational quiz generation from uploaded documents.
