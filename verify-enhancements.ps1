# Verification script for customer-web enhancements in Docker
Write-Host "=== Verifying Customer-Web Enhancements ===" -ForegroundColor Cyan
Write-Host ""

# Check if container is running
Write-Host "1. Checking container status..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=platepal-customer-web" --format "{{.Status}}"
if ($containerStatus) {
    Write-Host "   [OK] Container is running: $containerStatus" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Container is not running!" -ForegroundColor Red
    exit 1
}

# Check payment page
Write-Host ""
Write-Host "2. Checking payment page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3006/payment" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   [OK] Payment page accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Payment page not accessible: $_" -ForegroundColor Red
}

# Check home page
Write-Host ""
Write-Host "3. Checking home page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3006" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "   [OK] Home page accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Home page not accessible: $_" -ForegroundColor Red
}

# Check if payment page JS exists in build
Write-Host ""
Write-Host "4. Checking build artifacts..." -ForegroundColor Yellow
$buildCheck = docker exec platepal-customer-web sh -c 'if [ -f /app/.next/server/app/payment/page.js ]; then echo exists; else echo missing; fi' 2>&1
if ($buildCheck -match "exists") {
    Write-Host "   [OK] Payment page built successfully" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Payment page not found in build" -ForegroundColor Red
}

# Check routes manifest
Write-Host ""
Write-Host "5. Checking routes..." -ForegroundColor Yellow
$routesCheck = docker exec platepal-customer-web sh -c 'grep -i payment /app/.next/routes-manifest.json' 2>&1
if ($routesCheck -match "payment") {
    Write-Host "   [OK] Payment route registered" -ForegroundColor Green
} else {
    Write-Host "   [FAIL] Payment route not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Verification Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test the enhancements manually:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3006 in your browser" -ForegroundColor White
Write-Host "2. Add items from multiple restaurants to cart" -ForegroundColor White
Write-Host "3. Click Place Order to go to payment page" -ForegroundColor White
Write-Host "4. Verify INR currency formatting" -ForegroundColor White
Write-Host "5. Check address form for Indian format" -ForegroundColor White
Write-Host "6. Verify images are generated for restaurants/food" -ForegroundColor White
