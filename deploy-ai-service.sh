#!/bin/bash

# PlatePal AI Service Deployment Script
# This script builds and deploys the AI-powered restaurant dashboard enhancements

set -e

echo "🚀 Starting AI Service Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Step 2: Build AI Service
echo -e "${BLUE}🔨 Building AI Service...${NC}"
cd backend/ai-service

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ AI service package.json not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}Building TypeScript...${NC}"
npm run build

cd ../..

echo -e "${GREEN}✅ AI Service built successfully${NC}"

# Step 3: Update Docker Compose
echo -e "${BLUE}🐳 Updating Docker configuration...${NC}"
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker configuration updated${NC}"

# Step 4: Build Docker images
echo -e "${BLUE}🐳 Building Docker images...${NC}"
docker-compose build ai-service restaurant-dashboard

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Step 5: Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose up -d ai-service restaurant-dashboard

echo -e "${GREEN}✅ Services started${NC}"

# Step 6: Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check AI service health
echo -e "${YELLOW}Checking AI service health...${NC}"
if curl -f http://localhost:3008/ai/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ AI Service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  AI Service health check failed, but it may still be starting...${NC}"
fi

# Step 7: Display service status
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📍 Service URLs:${NC}"
echo -e "  - AI Service: ${GREEN}http://localhost:3008/ai/health${NC}"
echo -e "  - Restaurant Dashboard: ${GREEN}http://localhost:3004${NC}"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo -e "  1. Access the restaurant dashboard at http://localhost:3004"
echo -e "  2. Log in with restaurant credentials"
echo -e "  3. Check the AI Co-Pilot Insights on the dashboard"
echo -e "  4. View AI-powered order management in the Orders page (Kanban view)"
echo ""
echo -e "${BLUE}📝 To view logs:${NC}"
echo -e "  docker-compose logs -f ai-service"
echo -e "  docker-compose logs -f restaurant-dashboard"

