# PlatePal AI Service Deployment Script (PowerShell)
# This script builds and deploys the AI-powered restaurant dashboard enhancements

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting AI Service Deployment..." -ForegroundColor Blue

# Step 1: Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Blue

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Step 2: Build AI Service
Write-Host "`n🔨 Building AI Service..." -ForegroundColor Blue

Push-Location backend/ai-service

if (-not (Test-Path "package.json")) {
    Write-Host "❌ AI service package.json not found" -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Building TypeScript..." -ForegroundColor Yellow
npm run build

Pop-Location

Write-Host "✅ AI Service built successfully" -ForegroundColor Green

# Step 3: Update Docker Compose
Write-Host "`n🐳 Verifying Docker configuration..." -ForegroundColor Blue

if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ docker-compose.yml not found" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker configuration verified" -ForegroundColor Green

# Step 4: Build Docker images
Write-Host "`n🐳 Building Docker images..." -ForegroundColor Blue
docker-compose build ai-service restaurant-dashboard

Write-Host "✅ Docker images built successfully" -ForegroundColor Green

# Step 5: Start services
Write-Host "`n🚀 Starting services..." -ForegroundColor Blue
docker-compose up -d ai-service restaurant-dashboard

Write-Host "✅ Services started" -ForegroundColor Green

# Step 6: Wait for services to be healthy
Write-Host "`n⏳ Waiting for services to be healthy..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Check AI service health
Write-Host "Checking AI service health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3008/ai/health" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ AI Service is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  AI Service health check failed, but it may still be starting..." -ForegroundColor Yellow
}

# Step 7: Display service status
Write-Host "`n📊 Service Status:" -ForegroundColor Blue
docker-compose ps

Write-Host ""
Write-Host "✨ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Service URLs:" -ForegroundColor Blue
Write-Host "  - AI Service: http://localhost:3008/ai/health" -ForegroundColor Green
Write-Host "  - Restaurant Dashboard: http://localhost:3004" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Access the restaurant dashboard at http://localhost:3004"
Write-Host "  2. Log in with restaurant credentials"
Write-Host "  3. Check the AI Co-Pilot Insights on the dashboard"
Write-Host "  4. View AI-powered order management in the Orders page (Kanban view)"
Write-Host ""
Write-Host "📝 To view logs:" -ForegroundColor Blue
Write-Host "  docker-compose logs -f ai-service"
Write-Host "  docker-compose logs -f restaurant-dashboard"

