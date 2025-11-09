# PowerShell script to rebuild Docker containers with new enhancements
# Run this script after Docker Desktop is running

Write-Host "🚀 Rebuilding Docker containers with new enhancements..." -ForegroundColor Cyan

# Stop existing containers
Write-Host "📦 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Rebuild frontend (delivery-web)
Write-Host "🔨 Rebuilding delivery-web..." -ForegroundColor Yellow
docker-compose build --no-cache delivery-web

# Rebuild backend (order-service)
Write-Host "🔨 Rebuilding order-service..." -ForegroundColor Yellow
docker-compose build --no-cache order-service

# Start all services
Write-Host "🚀 Starting all services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host "✅ Service status:" -ForegroundColor Green
docker-compose ps

Write-Host ""
Write-Host "✨ Docker containers updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check logs: docker-compose logs -f delivery-web"
Write-Host "  2. Check logs: docker-compose logs -f order-service"
Write-Host "  3. Access delivery-web at: http://localhost:3007"
Write-Host ""

