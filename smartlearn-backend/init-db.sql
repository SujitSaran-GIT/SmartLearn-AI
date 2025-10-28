-- SmartLearn Database Initialization Script
-- This script is run when the PostgreSQL container starts for the first time

-- Create database and user (already created by environment variables)
-- POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD are set via docker-compose

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created by the application using Prisma or direct SQL
-- This file can be used for any additional database setup if needed
