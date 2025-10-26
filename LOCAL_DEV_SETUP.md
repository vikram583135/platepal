# Local Development Setup Guide

This guide explains how to run PlatePal services **locally** (outside Docker) for development.

## Problem

When running services locally (e.g., `npm run start:dev`), they try to connect to `postgres_db` and `mongo_db`, which are Docker network hostnames that don't exist outside Docker.

## Solution: Two Options

### Option 1: Run Everything in Docker (Recommended)

This is the easiest approach and what you should use for production-like testing:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services will be available at:**
- User Service: http://localhost:3001
- Restaurant Service: http://localhost:3002
- Order Service: http://localhost:3003
- Restaurant Dashboard: http://localhost:3004
- Admin Dashboard: http://localhost:3005

---

### Option 2: Run Services Locally (For Development)

If you want to run individual services locally for faster development cycles:

#### Step 1: Start Only the Databases in Docker

```bash
# Start just PostgreSQL and MongoDB
docker-compose up -d postgres_db mongo_db
```

#### Step 2: Set Environment Variables

Before running any service locally, set these environment variables:

**For PowerShell (Windows):**
```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_USERNAME="platepal_user"
$env:DB_PASSWORD="your_strong_password_123!"
$env:DB_NAME="platepal_db"
$env:MONGO_URL="mongodb://platepal_mongo_user:your_mongo_password_123!@localhost:27017/platepal_menus?authSource=admin"
$env:JWT_SECRET="your_jwt_secret_key_here"
$env:PORT="3002"
```

**For Bash (Git Bash, Linux, macOS):**
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=platepal_user
export DB_PASSWORD=your_strong_password_123!
export DB_NAME=platepal_db
export MONGO_URL="mongodb://platepal_mongo_user:your_mongo_password_123!@localhost:27017/platepal_menus?authSource=admin"
export JWT_SECRET=your_jwt_secret_key_here
export PORT=3002
```

#### Step 3: Run the Service

```bash
# Navigate to the service directory
cd backend/restaurant-service

# Install dependencies (if not already done)
npm install

# Run in development mode
npm run start:dev
```

#### Step 4: Repeat for Other Services

For **user-service** (use PORT=3001):
```powershell
# PowerShell
$env:DB_HOST="localhost"
$env:PORT="3001"
cd backend/user-service
npm run start:dev
```

For **order-service** (use PORT=3003):
```powershell
# PowerShell
$env:DB_HOST="localhost"
$env:PORT="3003"
cd backend/order-service
npm run start:dev
```

---

## Current Error Explanation

The error you're seeing:
```
Error: getaddrinfo ENOTFOUND postgres_db
```

This means the service is trying to connect to `postgres_db` (a Docker hostname), but it can't find it because you're running outside of Docker.

**Quick Fix:** 
1. Stop the locally running service (Ctrl+C)
2. Use `docker-compose up -d` to run everything in Docker

---

## Recommended Workflow

### For Full System Testing:
```bash
docker-compose up -d
docker-compose logs -f
```

### For Backend Development:
```bash
# Terminal 1: Start databases only
docker-compose up -d postgres_db mongo_db

# Terminal 2: Run service with env vars
cd backend/restaurant-service
# Set environment variables (see Step 2 above)
npm run start:dev
```

### For Frontend Development:
```bash
# Terminal 1: Keep Docker services running
docker-compose up -d

# Terminal 2: Run frontend locally
cd restaurant-dashboard
npm run dev
```

---

## Testing the Services

Once services are running (either in Docker or locally):

```bash
# Test user service
curl http://localhost:3001

# Test restaurant service
curl http://localhost:3002/restaurants

# Test order service
curl http://localhost:3003/analytics/summary
```

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** Make sure Docker databases are running:
```bash
docker-compose up -d postgres_db mongo_db
docker-compose ps
```

### Issue: "Port already in use"
**Solution:** Stop conflicting services:
```bash
# Check what's using the port
netstat -ano | findstr :3002

# Stop Docker services
docker-compose down
```

### Issue: "Module not found"
**Solution:** Install dependencies:
```bash
cd backend/[service-name]
npm install
```

---

## Summary

- **Production/Testing:** Use `docker-compose up -d`
- **Local Development:** Start databases in Docker, run services with environment variables pointing to `localhost`
- **Current Fix:** Run `docker-compose up -d` to avoid connection errors

