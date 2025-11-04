# Customer Web Docker Setup

## Overview
This document describes the Docker setup for the customer-web application with all new enhancements including:
- Multi-restaurant cart support
- Payment page with Indian address format
- INR currency conversion
- Image generation for restaurants and food items
- Enhanced UI/UX with glassmorphism effects

## Building the Docker Image

### Build locally:
```bash
docker build -t platepal-customer-web:latest ./customer-web
```

### Run locally:
```bash
docker run -p 3006:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=http://localhost:3002 \
  -e NEXT_PUBLIC_AUTH_URL=http://localhost:3001 \
  -e NEXT_PUBLIC_ORDER_URL=http://localhost:3003 \
  platepal-customer-web:latest
```

## Using Docker Compose

The customer-web service is already configured in the root `docker-compose.yml`.

### Start all services:
```bash
docker-compose up -d
```

### Start only customer-web:
```bash
docker-compose up -d customer-web
```

### Rebuild customer-web:
```bash
docker-compose build customer-web
docker-compose up -d customer-web
```

### View logs:
```bash
docker-compose logs -f customer-web
```

## Environment Variables

The following environment variables are configured in docker-compose.yml:

- `NODE_ENV`: Set to `production`
- `NEXT_PUBLIC_USE_NGINX_PROXY`: Set to `true` to use nginx proxy paths
- `NEXT_PUBLIC_API_URL`: Restaurant service URL (uses `/api/restaurants` with nginx)
- `NEXT_PUBLIC_AUTH_URL`: User service URL (uses `/api/auth` with nginx)
- `NEXT_PUBLIC_ORDER_URL`: Order service URL (uses `/api/orders` with nginx)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL for real-time updates (uses `/socket.io` with nginx)

### Why Nginx Proxy?

The application uses nginx as a reverse proxy to route API calls. This allows:
- Single origin for CORS (no CORS issues)
- Unified API access through `/api/*` paths
- Better security and routing
- WebSocket support through nginx

The application automatically detects if nginx proxy is enabled and uses relative paths instead of full URLs.

## Networking

The customer-web service:
- Runs on port 3006 externally (maps to 3000 internally)
- Uses the `platepal-network` Docker network
- Can access backend services using service names:
  - `restaurant-service:3002`
  - `user-service:3001`
  - `order-service:3003`

## Health Check

The container includes a health check that:
- Checks HTTP status every 30 seconds
- Times out after 10 seconds
- Retries 3 times before marking unhealthy
- Waits 40 seconds before starting checks

## Image Optimization

The Dockerfile uses:
- Multi-stage build for smaller image size
- Alpine Linux for minimal footprint
- Standalone Next.js output for optimal performance
- Non-root user for security

## Troubleshooting

### Build fails:
1. Ensure Node.js 18+ is available
2. Check that all dependencies are in package.json
3. Verify .dockerignore isn't excluding necessary files

### Container won't start:
1. Check logs: `docker-compose logs customer-web`
2. Verify backend services are running
3. Check network connectivity: `docker network inspect platepal-network`

### Images not loading:
1. Verify Unsplash domains are allowed in next.config.ts
2. Check network connectivity to external image sources
3. Review image optimization settings

