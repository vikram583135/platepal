# AI Service Deployment Guide

## Overview

This guide covers the deployment of the AI-powered enhancements to the PlatePal restaurant dashboard, including the new AI service microservice and all integrated features.

## Architecture

### New Services

**AI Service** (`backend/ai-service`)
- Port: 3008 (external) → 3004 (internal)
- Technology: NestJS with Google Gemini API
- Purpose: AI-powered insights, recommendations, and analysis

### Updated Services

**Restaurant Dashboard** (`restaurant-dashboard`)
- Enhanced with AI Co-Pilot features
- Integrated with AI service for all AI-powered functionality

## Docker Configuration

### AI Service Configuration

The AI service is added to `docker-compose.yml` with:

```yaml
ai-service:
  build:
    context: ./backend/ai-service
    dockerfile: Dockerfile
  environment:
    - OPENAI_API_KEY=AIzaSyDggWZsA2tgnPVrKHtjdbE1hwDQx6v6rlw
    - GEMINI_API_KEY=AIzaSyDggWZsA2tgnPVrKHtjdbE1hwDQx6v6rlw
    - ORDER_SERVICE_URL=http://order-service:3003
    - RESTAURANT_SERVICE_URL=http://restaurant-service:3002
    - PORT=3004
  ports:
    - "3008:3004"
  depends_on:
    - order-service
    - restaurant-service
```

### Restaurant Dashboard Updates

The restaurant dashboard now includes:

```yaml
environment:
  - NEXT_PUBLIC_AI_SERVICE_URL=http://ai-service:3004
```

### Nginx Configuration

AI service routes added to `nginx.conf`:

```
location ~ ^/api/ai(/.*)?$ {
    rewrite ^/api/ai(/.*)?$ /ai$1 break;
    proxy_pass http://ai-service;
    ...
}
```

## Deployment Steps

### Option 1: Using Deployment Scripts

**Linux/Mac:**
```bash
chmod +x deploy-ai-service.sh
./deploy-ai-service.sh
```

**Windows:**
```powershell
.\deploy-ai-service.ps1
```

### Option 2: Manual Deployment

1. **Build AI Service:**
```bash
cd backend/ai-service
npm install
npm run build
cd ../..
```

2. **Build Docker Images:**
```bash
docker-compose build ai-service restaurant-dashboard
```

3. **Start Services:**
```bash
docker-compose up -d ai-service restaurant-dashboard
```

4. **Verify Deployment:**
```bash
docker-compose ps
curl http://localhost:3008/ai/health
```

## Testing

### Run Test Scripts

**Linux/Mac:**
```bash
chmod +x test-ai-service.sh
./test-ai-service.sh
```

**Windows:**
```powershell
.\test-ai-service.ps1
```

### Manual Testing

1. **Health Check:**
```bash
curl http://localhost:3008/ai/health
```

2. **Dashboard Summary:**
```bash
curl -X POST http://localhost:3008/ai/dashboard/summary \
  -H "Content-Type: application/json" \
  -d '{"restaurantId": 1}'
```

3. **Access Dashboard:**
   - Open http://localhost:3004
   - Log in with restaurant credentials
   - Check AI Co-Pilot Insights on dashboard
   - Test Kanban order view with AI flags

## Features Deployed

### 1. AI Dashboard Summary
- Sales forecast with confidence scores
- Popular item tracking
- Urgent alerts system

### 2. Natural Language Analytics
- Query interface for data analysis
- Chart insights generation

### 3. Visual Order Queue (Kanban)
- AI-powered order flags
- Priority-based sorting
- Estimated prep times

### 4. Menu Performance Analysis
- Item comparison and recommendations
- Performance scoring

### 5. Pricing Optimizer
- AI-powered pricing suggestions
- Impact predictions

### 6. Review Sentiment Analysis
- Automated categorization
- AI-generated reply suggestions

### 7. Smart Promotion Generator
- Data-driven promotion ideas
- Impact predictions

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| AI Service | http://localhost:3008 | AI API endpoints |
| Restaurant Dashboard | http://localhost:3004 | Restaurant management UI |

## Environment Variables

### AI Service (.env)

```env
OPENAI_API_KEY=AIzaSyDggWZsA2tgnPVrKHtjdbE1hwDQx6v6rlw
GEMINI_API_KEY=AIzaSyDggWZsA2tgnPVrKHtjdbE1hwDQx6v6rlw
ORDER_SERVICE_URL=http://order-service:3003
RESTAURANT_SERVICE_URL=http://restaurant-service:3002
PORT=3004
NODE_ENV=production
```

### Restaurant Dashboard (Docker)

```env
NEXT_PUBLIC_AI_SERVICE_URL=http://ai-service:3004
```

## Troubleshooting

### AI Service Not Starting

1. Check logs:
```bash
docker-compose logs ai-service
```

2. Verify API key:
```bash
docker-compose exec ai-service env | grep GEMINI
```

3. Check dependencies:
```bash
docker-compose exec ai-service npm list @google/generative-ai
```

### Frontend Not Connecting to AI Service

1. Verify environment variable:
```bash
docker-compose exec restaurant-dashboard env | grep AI_SERVICE
```

2. Check network connectivity:
```bash
docker-compose exec restaurant-dashboard wget -O- http://ai-service:3004/ai/health
```

### Health Check Failures

1. Wait for service to fully start (40s start period)
2. Check service logs for errors
3. Verify port mappings in docker-compose.yml

## Next Steps

1. **Test All Features:**
   - Dashboard AI insights
   - Order Kanban with AI flags
   - Menu performance analysis
   - Review sentiment analysis
   - Promotion suggestions

2. **Monitor Performance:**
   - Check AI service response times
   - Monitor API usage
   - Review error logs

3. **Optimize:**
   - Adjust AI model parameters if needed
   - Fine-tune caching strategies
   - Optimize database queries

## Support

For issues or questions:
- Check service logs: `docker-compose logs -f [service-name]`
- Review health status: `docker-compose ps`
- Test endpoints: Use provided test scripts

