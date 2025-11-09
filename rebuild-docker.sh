#!/bin/bash

# Rebuild Docker containers with new enhancements
# Run this script after Docker Desktop is running

echo "🚀 Rebuilding Docker containers with new enhancements..."

# Stop existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Rebuild frontend (delivery-web)
echo "🔨 Rebuilding delivery-web..."
docker-compose build --no-cache delivery-web

# Rebuild backend (order-service)
echo "🔨 Rebuilding order-service..."
docker-compose build --no-cache order-service

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "✅ Service status:"
docker-compose ps

echo ""
echo "✨ Docker containers updated successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Check logs: docker-compose logs -f delivery-web"
echo "  2. Check logs: docker-compose logs -f order-service"
echo "  3. Access delivery-web at: http://localhost:3007"
echo ""

