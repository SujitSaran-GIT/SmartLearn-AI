# SmartLearn Backend Docker Deployment Guide

This guide provides comprehensive instructions for deploying the SmartLearn Backend (Node.js API + Python AI Worker) using Docker and Docker Compose.

## Architecture Overview

The backend consists of the following services:
- **PostgreSQL** - Primary database
- **Redis** - Caching and job queues
- **MinIO** - Object storage for files
- **Backend** - Node.js Express API server
- **AI Worker** - Python service for MCQ generation

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 4GB RAM available
- At least 10GB free disk space

## Quick Start

1. **Clone the repository and navigate to the smartlearn-backend folder:**

```bash
cd smartlearn-backend
```

2. **Configure environment variables:**

```bash
cp docker-compose.env .env
```

Edit `.env` file and configure the following:
- `GROQ_API_KEY` - Your Groq API key
- `OPENAI_API_KEY` - Your OpenAI API key (optional)
- Update JWT secrets for production use

3. **Start all services:**

```bash
docker-compose up -d
```

4. **Check service status:**

```bash
docker-compose ps
```

5. **View logs:**

```bash
docker-compose logs -f
```

The backend will be available at:
- **API**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (admin/minioadmin123)
- **Health Check**: http://localhost:3000/health

## Detailed Setup Instructions

### 1. Environment Configuration

The deployment uses environment variables from `docker-compose.env`. Copy this file and modify as needed:

```bash
cp docker-compose.env .env
```

#### Required Environment Variables:

```bash
# API Keys (MANDATORY)
GROQ_API_KEY=your_groq_api_key_here         # Get from groq.com
OPENAI_API_KEY=your_openai_api_key_here     # Optional, for fallback

# JWT Secrets (CHANGE IN PRODUCTION)
JWT_SECRET=your_super_secure_jwt_secret
JWT_REFRESH_SECRET=your_super_secure_refresh_secret

# AI Worker Secret (CHANGE IN PRODUCTION)
AI_WORKER_SECRET=your_ai_worker_secret_key
```

#### Optional Variables:

```bash
# Frontend URL (for CORS)
FRONTEND_URL=https://yourfrontend.com

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=1000    # Increase for production
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes

# File Upload
MAX_FILE_SIZE=104857600         # 100MB max file size
```

### 2. Service Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Backend       │
│   (External)    │    │   (Port 3000)   │
└─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼───┐
            │  Redis    │ │  AI   │ │  MinIO │
            │  (Port    │ │ Worker│ │ (Port  │
            │  6379)    │ │        │ │ 9000)  │←─┐
            └───────────┘ └───────┘ └────────┘   │
                    │                   ▲        │
                    └───────────────────┼────────┘
                               ┌────────▼───┐
                               │ PostgreSQL │
                               │  (Port     │
                               │   5432)    │
                               └────────────┘
```

### 3. Database Migration

The application uses Prisma for database management. To run migrations in Docker:

```bash
# Generate Prisma client and run migrations
docker-compose exec backend npx prisma generate
docker-compose exec backend npx prisma db push

# Create initial admin user (optional)
docker-compose exec backend node -e "
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
console.log('Generated password hash for admin user');
"
```

## Production Deployment

### 1. Security Hardening

```bash
# Generate secure random secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
openssl rand -base64 32  # For AI_WORKER_SECRET

# Update .env file with these values
```

### 2. SSL Configuration

For production, configure SSL certificates:

```bash
# Update docker-compose.yml to include SSL
environment:
  - HTTPS=true
  - SSL_CERT_PATH=/path/to/cert.pem
  - SSL_KEY_PATH=/path/to/key.pem
```

### 3. External Database

For production, use external PostgreSQL:

```yaml
# In docker-compose.yml, comment out postgres service
# services:
#   postgres:
#     ...

# Update backend environment
environment:
  DB_HOST: your-external-postgres-host
  DB_PORT: 5432
  DB_NAME: your_database_name
  DB_USER: your_db_user
  DB_PASSWORD: your_db_password
```

### 4. Scaling

```bash
# Scale the backend services
docker-compose up -d --scale backend=3
docker-compose up -d --scale ai-worker=2

# Scale database for high availability (advanced)
docker-compose up -d --scale postgres=3
```

## Monitoring and Maintenance

### Health Checks

All services include built-in health checks:

```bash
# Check all service health
docker-compose ps

# View detailed health status
docker-compose exec backend curl -f http://localhost:3000/health

# Monitor resource usage
docker stats
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f ai-worker

# View last 100 lines
docker-compose logs --tail=100 backend

# Follow logs with timestamps
docker-compose logs -f -t backend
```

### Backup and Recovery

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres smartlearn > backup.sql

# Backup volumes
docker run --rm -v smartlearn-backend_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore database
docker-compose exec -T postgres psql -U postgres smartlearn < backup.sql
```

## Troubleshooting

### Common Issues

1. **Service fails to start**

```bash
# Check resource availability
docker system df

# View detailed error logs
docker-compose logs --tail=50 [service_name]

# Restart specific service
docker-compose restart [service_name]
```

2. **MinIO bucket not accessible**

```bash
# Create bucket manually if needed
docker-compose exec minio mc mb minio/smartlearn-files
```

3. **AI Worker connection failed**

```bash
# Check Redis connectivity
docker-compose exec ai-worker redis-cli -h redis ping

# Verify environment variables
docker-compose exec ai-worker env | grep -E "(REDIS|BACKEND|AI_WORKER)"
```

4. **Database connection error**

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test database connectivity
docker-compose exec backend npx prisma studio
```

### Port Conflicts

If ports are already in use:

```bash
# Find processes using ports
lsof -i :3000  # For backend
lsof -i :5432  # For PostgreSQL
lsof -i :6379  # For Redis
lsof -i :9000  # For MinIO

# Update docker-compose.yml with different ports
ports:
  - "3001:3000"  # Change backend port to 3001
```

### Resource Issues

If services are slow or failing:

```bash
# Check resource usage
docker stats

# Increase Docker memory limit (Docker Desktop)
# Settings -> Resources -> Memory (at least 4GB)

# For production server, ensure:
# - CPU: 2+ cores
# - RAM: 4GB+ minimum, 8GB+ recommended
# - Disk: 20GB+ SSD storage
```

## API Testing

Once deployed, test the API endpoints:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api

# Test authentication (replace with actual values)
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

See `API_TESTING_GUIDE.md` for comprehensive API testing instructions.

## Development Workflow

### Local Development with Docker

```bash
# Start only infrastructure services
docker-compose up -d postgres redis minio

# Develop with local backend
cd backend && npm run dev

# Develop with local AI worker
cd ../ai-worker && python src/worker.py
```

### Updating Services

```bash
# Pull latest images
docker-compose pull

# Rebuild specific service
docker-compose build backend

# Restart with new images
docker-compose up -d
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Monitor disk usage: `docker system df`
   - Check service health: `docker-compose ps`
   - Review logs for errors

2. **Monthly:**
   - Backup database and volumes
   - Update Docker images: `docker-compose pull`
   - Clean up unused resources: `docker system prune`

3. **Quarterly:**
   - Review and rotate secrets
   - Update API keys if expired
   - Test disaster recovery procedures

### Getting Help

If you encounter issues:
1. Check the logs: `docker-compose logs -f [service_name]`
2. Verify environment variables
3. Check network connectivity between containers
4. Ensure sufficient system resources
5. Review Docker and Docker Compose versions

## Production Checklist

- [ ] Environment variables configured with production values
- [ ] API keys obtained and configured
- [ ] JWT secrets generated securely
- [ ] SSL certificates configured (if applicable)
- [ ] Database backups scheduled
- [ ] Monitoring and alerting set up
- [ ] Firewall rules configured
- [ ] Resource limits set appropriately
- [ ] Automatic restarts configured
- [ ] Health checks verified
- [ ] Load testing completed

## Final Notes

This Docker setup provides a complete, production-ready deployment of the SmartLearn Backend. The services are configured to:

- Automatically restart on failures
- Include health checks for monitoring
- Use efficient resource allocation
- Provide secure defaults
- Scale horizontally if needed

Monitor the services regularly and keep Docker and base images updated for security patches.
