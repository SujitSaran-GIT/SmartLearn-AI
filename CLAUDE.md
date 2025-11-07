# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart-Learn is an AI-powered quiz generation platform that allows users to upload PDF documents and automatically generate multiple-choice questions using various LLM providers (Groq, Google AI, OpenAI). The application consists of a React frontend, Node.js backend API, and Python AI worker service.

## Development Commands

### Frontend (smartlearn-frontend/)
- **Development**: `npm run dev` - Start Vite development server
- **Build**: `npm run build` - TypeScript compilation + Vite build
- **Lint**: `npm run lint` - Run ESLint
- **Preview**: `npm run preview` - Preview production build

### Backend (smartlearn-backend/backend/)
- **Development**: `npm run dev` - Start server with nodemon
- **Production**: `npm start` - Start Node.js server
- **Database Commands**:
  - `npm run db:generate` - Generate Prisma client
  - `npm run db:push` - Push schema to database
  - `npm run db:migrate` - Run database migrations
  - `npm run db:studio` - Open Prisma Studio

### AI Worker (smartlearn-backend/ai-worker/)
- **Dependencies**: `pip install -r requirements.txt`
- **Run**: `uvicorn src.worker:app --reload` (for local development)
- **FastAPI server runs on port 8000**

### Docker Deployment
- **Full Stack**: `docker-compose up -d` (from smartlearn-backend/)
- **Individual Services**: Use specific service names in docker-compose
- **Environment**: Copy `docker-compose.env.example` to `docker-compose.env` and configure

## Architecture

### Frontend Structure
- **React 19 + TypeScript** with Vite build system
- **State Management**: Redux Toolkit with React-Redux
- **Routing**: React Router v7
- **Styling**: Tailwind CSS with Framer Motion animations
- **Key Pages**: Dashboard, Quiz Generation, Quiz Taking, History, Leaderboard

### Backend Structure
- **Node.js + Express** REST API server
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: MinIO (S3-compatible)
- **Caching/Queue**: Redis with BullMQ for job processing
- **Authentication**: JWT with refresh tokens
- **Security**: Helmet, CORS, rate limiting, Zod validation

### AI Worker Structure
- **Python + FastAPI** service for async MCQ generation
- **PDF Processing**: PyMuPDF for text extraction
- **LLM Integration**: Groq (primary), Google Gemini, OpenAI GPT
- **Queue Processing**: Redis/BullMQ for backend communication

## Data Flow

1. **File Upload**: Frontend → Backend API → MinIO storage
2. **Quiz Generation**: Frontend request → Backend creates Redis job → AI Worker processes → LLM generates MCQs → Results stored in PostgreSQL
3. **Quiz Taking**: Frontend fetches quiz → User interacts → Results saved to database

## Key Configuration

### Environment Variables (Backend)
- Database: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- MinIO: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- Redis: `REDIS_URL`
- JWT: `JWT_SECRET`, `JWT_REFRESH_SECRET`
- AI Keys: `GROQ_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_AI_API_KEY`

### Frontend Configuration
- API base URL configured in `src/services/api.ts`
- Redux store configured in `src/redux/store.ts`
- Router setup in `src/App.tsx`

## Database Schema

Key tables (managed by Prisma):
- **users**: User accounts with authentication
- **files**: Uploaded PDF metadata
- **quizzes**: Generated quiz information
- **questions**: Individual quiz questions
- **quiz_attempts**: User quiz attempts and scores
- **user_files**: File ownership mapping

## API Endpoints Structure

- **Authentication**: `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`
- **Files**: `/api/files/upload`, `/api/files/:id`, `/api/files/:id/delete`
- **Quizzes**: `/api/quizzes`, `/api/quizzes/:id`, `/api/quizzes/generate`
- **Attempts**: `/api/attempts`, `/api/attempts/:id`, `/api/attempts/submit`

## Testing

Currently no formal test suite is implemented. When adding tests:
- Frontend: Consider Vitest + React Testing Library
- Backend: Consider Jest + Supertest
- Integration: Test the full quiz generation flow

## Development Tips

- Backend runs on port 3000, Frontend dev server on port 5173
- Use Prisma Studio (`npm run db:studio`) to inspect database
- Check Redis queue: Use Redis CLI or GUI tools
- MinIO console available at http://localhost:9001 (when running locally)
- AI Worker logs show job processing and LLM API calls

## Common Issues

- **Port conflicts**: Ensure ports 3000, 5173, 6379, 5432, 9000, 9001 are available
- **Environment variables**: All services must share the same environment configuration
- **CORS issues**: Frontend URL must be in `FRONTEND_URL` environment variable
- **Database connection**: PostgreSQL must be running before starting backend
- **Redis connection**: Required for both backend caching and AI worker communication