# PlatePal Docker Setup Guide

## Overview

This guide covers the Docker configuration for all PlatePal services, including optimized builds, WebSocket support, and health checks.

---

## 🐳 Docker Services

### Backend Services

#### 1. User Service (`user-service`)
- **Port**: 3001
- **Database**: PostgreSQL
- **Health Check**: Enabled
- **Multi-stage build**: Optimized with production dependencies only

#### 2. Restaurant Service (`restaurant-service`)
- **Port**: 3002
- **Databases**: PostgreSQL, MongoDB
- **Health Check**: Enabled
- **CORS**: Configured for all frontend origins

#### 3. Order Service (`order-service`)
- **Port**: 3003
- **Database**: PostgreSQL
- **WebSocket**: Enabled on `/socket.io/`
- **Health Check**: Enabled
- **CORS**: Configured for all frontend origins

### Frontend Services

#### 4. Restaurant Dashboard (`restaurant-dashboard`)
- **Port**: 3004 (external) → 3000 (internal)
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: Restaurant service URL
  - `NEXT_PUBLIC_AUTH_URL`: User service URL
  - `NEXT_PUBLIC_ORDER_URL`: Order service URL
  - `NEXT_PUBLIC_WS_URL`: WebSocket URL

#### 5. Admin Dashboard (`admin-dashboard`)
- **Port**: 3005 (external) → 3000 (internal)
- **Environment Variables**: Same as Restaurant Dashboard

#### 6. Customer Web (`customer-web`)
- **Port**: 3006 (external) → 3000 (internal)
- **Environment Variables**: API and WebSocket URLs

#### 7. Delivery Web (`delivery-web`)
- **Port**: 3007 (external) → 3000 (internal)
- **Environment Variables**: API and WebSocket URLs

### Infrastructure

#### 8. PostgreSQL Database (`postgres_db`)
- **Port**: 5433 (external) → 5432 (internal)
- **Version**: 15-alpine

#### 9. MongoDB Database (`mongo_db`)
- **Port**: 27017
- **Version**: latest

#### 10. Nginx Reverse Proxy (`nginx`)
- **Ports**: 80, 443
- **Features**: 
  - API routing
  - Frontend routing
  - WebSocket support
  - SSL/TLS ready

---

## 🔧 Dockerfile Optimizations

### Frontend Dockerfiles (Next.js)

All frontend Dockerfiles use **multi-stage builds** with:

1. **Dependencies Stage**: Install production dependencies only
2. **Builder Stage**: Install all dependencies and build
3. **Runner Stage**: Minimal image with only built artifacts

**Key Features**:
- ✅ Non-root user execution
- ✅ Standalone output mode
- ✅ Optimized layer caching
- ✅ Minimal final image size
- ✅ Health checks

### Backend Dockerfiles (NestJS)

All backend Dockerfiles use **multi-stage builds** with:

1. **Builder Stage**: Install dependencies and build TypeScript
2. **Runner Stage**: Production image with compiled JavaScript only

**Key Features**:
- ✅ Non-root user execution
- ✅ Production dependencies only
- ✅ Health check endpoints
- ✅ Optimized image size

---

## 🌐 WebSocket Configuration

### Order Service
- WebSocket endpoint: `/socket.io/`
- Supports Socket.IO protocol
- Authentication via JWT tokens
- Room-based connections

### Nginx Configuration
- WebSocket upgrade headers configured
- Long timeout (24 hours) for persistent connections
- Proper connection upgrade handling

### Environment Variables
All frontend services include:
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL
- Configured for internal Docker network

---

## 📦 Environment Variables

### Frontend Services

**Common Variables**:
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://restaurant-service:3002
NEXT_PUBLIC_AUTH_URL=http://user-service:3001
NEXT_PUBLIC_ORDER_URL=http://order-service:3003
NEXT_PUBLIC_WS_URL=ws://order-service:3003
```

**Note**: Internal Docker network uses service names, not `localhost`

### Backend Services

**Common Variables**:
```bash
NODE_ENV=production
DB_HOST=postgres_db
DB_PORT=5432
DB_USERNAME=platepal_user
DB_PASSWORD=your_strong_password_123!
DB_NAME=platepal_db
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3004,http://localhost:3005,http://localhost:3006,http://localhost:3007
```

---

## 🚀 Quick Start

### Build All Images

```bash
docker-compose build
```

### Start All Services

```bash
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f customer-web
docker-compose logs -f order-service
```

### Stop All Services

```bash
docker-compose down
```

### Rebuild and Restart

```bash
docker-compose up -d --build
```

---

## 🏥 Health Checks

All services include health checks:

- **Backend Services**: HTTP endpoint at `/health`
- **Frontend Services**: HTTP endpoint at `/api/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

Check service health:
```bash
docker-compose ps
```

---

## 🔒 Security Features

### Non-Root Users
- All containers run as non-root users
- Frontend: `nextjs` (UID 1001)
- Backend: `nestjs` (UID 1001)

### Network Isolation
- All services on `platepal-network` bridge network
- Internal communication only
- External access via exposed ports

### Secrets Management
- Environment variables for sensitive data
- **⚠️ Change default passwords in production**

---

## 📊 Service Ports

| Service | External Port | Internal Port | Access |
|---------|--------------|---------------|--------|
| User Service | 3001 | 3001 | API |
| Restaurant Service | 3002 | 3002 | API |
| Order Service | 3003 | 3003 | API + WebSocket |
| Restaurant Dashboard | 3004 | 3000 | Web |
| Admin Dashboard | 3005 | 3000 | Web |
| Customer Web | 3006 | 3000 | Web |
| Delivery Web | 3007 | 3000 | Web |
| PostgreSQL | 5433 | 5432 | Database |
| MongoDB | 27017 | 27017 | Database |
| Nginx | 80, 443 | 80, 443 | Reverse Proxy |

---

## 🔄 WebSocket Routing

Nginx routes WebSocket connections:
- **Path**: `/socket.io/`
- **Backend**: `order-service:3003`
- **Protocol**: WebSocket upgrade
- **Timeout**: 86400 seconds (24 hours)

---

## 📝 Docker Compose Commands

### Development

```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up

# Rebuild specific service
docker-compose build customer-web

# Restart specific service
docker-compose restart customer-web
```

### Production

```bash
# Build production images
docker-compose -f docker-compose.yml build --no-cache

# Start production stack
docker-compose -f docker-compose.yml up -d

# View production logs
docker-compose -f docker-compose.yml logs -f
```

### Maintenance

```bash
# Remove all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove containers, volumes, and images
docker-compose down -v --rmi all

# Prune unused resources
docker system prune -a
```

---

## 🐛 Troubleshooting

### Build Failures

1. **Clear Docker cache**:
   ```bash
   docker builder prune -a
   ```

2. **Rebuild without cache**:
   ```bash
   docker-compose build --no-cache
   ```

### Connection Issues

1. **Check service health**:
   ```bash
   docker-compose ps
   ```

2. **View service logs**:
   ```bash
   docker-compose logs [service-name]
   ```

3. **Verify network connectivity**:
   ```bash
   docker network inspect platepal-network
   ```

### WebSocket Issues

1. **Check nginx configuration**:
   ```bash
   docker-compose exec nginx nginx -t
   ```

2. **Verify WebSocket headers**:
   - Check `Upgrade` and `Connection` headers in nginx.conf

3. **Test WebSocket connection**:
   ```bash
   curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost/socket.io/
   ```

### Port Conflicts

If ports are already in use:
1. Stop conflicting services
2. Change ports in `docker-compose.yml`
3. Update environment variables accordingly

---

## 📈 Performance Optimizations

### Image Size
- Multi-stage builds reduce final image size
- Alpine Linux base images (~5MB)
- Production dependencies only in final stage

### Build Caching
- Layer caching for faster rebuilds
- Separate dependency installation stage
- Source code changes don't invalidate dependency cache

### Runtime
- Non-root user execution
- Health checks for automatic recovery
- Restart policies (unless-stopped)

---

## 🔐 Security Recommendations

1. **Change Default Passwords**:
   - Update `POSTGRES_PASSWORD`
   - Update `MONGO_INITDB_ROOT_PASSWORD`
   - Update `JWT_SECRET`

2. **Use Secrets Management**:
   - Docker secrets for production
   - Environment files (`.env`) not in version control

3. **Network Security**:
   - Use Docker networks for isolation
   - Limit exposed ports
   - Use reverse proxy (Nginx) for SSL/TLS

4. **Image Security**:
   - Regular base image updates
   - Scan images for vulnerabilities
   - Use specific image tags, not `latest`

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [NestJS Docker Deployment](https://docs.nestjs.com/recipes/docker)

---

*Last Updated: Based on Phase 1-6 Implementation*
*Version: 2.0*

