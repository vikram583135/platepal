# AI Service Testing Script (PowerShell)
# Tests all AI endpoints and validates functionality

$ErrorActionPreference = "Stop"

Write-Host "🧪 Testing AI Service..." -ForegroundColor Blue

$AI_SERVICE_URL = "http://localhost:3008"
$BASE_URL = "$AI_SERVICE_URL/ai"

# Test health endpoint
Write-Host "`nTesting health endpoint..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Health check failed" -ForegroundColor Red
    exit 1
}

# Test dashboard summary
Write-Host "`nTesting dashboard summary endpoint..." -ForegroundColor Blue
try {
    $body = @{
        restaurantId = 1
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BASE_URL/dashboard/summary" -Method POST `
        -ContentType "application/json" -Body $body -UseBasicParsing

    if ($response.Content -match "salesForecast|popularItem") {
        Write-Host "✅ Dashboard summary endpoint working" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Dashboard summary returned unexpected response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Dashboard summary test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test analytics query
Write-Host "`nTesting analytics query endpoint..." -ForegroundColor Blue
try {
    $body = @{
        query = "Compare weekend sales"
        restaurantId = 1
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BASE_URL/analytics/query" -Method POST `
        -ContentType "application/json" -Body $body -UseBasicParsing

    if ($response.Content -match "answer|data") {
        Write-Host "✅ Analytics query endpoint working" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Analytics query returned unexpected response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Analytics query test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test order analysis
Write-Host "`nTesting order analysis endpoint..." -ForegroundColor Blue
try {
    $body = @{
        order = @{
            items = @(@{name = "Test Item"; quantity = 2; price = 100})
            totalPrice = 200
        }
        restaurantId = 1
    } | ConvertTo-Json -Depth 10

    $response = Invoke-WebRequest -Uri "$BASE_URL/orders/analyze" -Method POST `
        -ContentType "application/json" -Body $body -UseBasicParsing

    if ($response.Content -match "complexity|priority") {
        Write-Host "✅ Order analysis endpoint working" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Order analysis returned unexpected response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Order analysis test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test review analysis
Write-Host "`nTesting review analysis endpoint..." -ForegroundColor Blue
try {
    $body = @{
        review = @{
            comment = "Great food!"
            rating = 5
        }
        restaurantId = 1
    } | ConvertTo-Json -Depth 10

    $response = Invoke-WebRequest -Uri "$BASE_URL/reviews/analyze" -Method POST `
        -ContentType "application/json" -Body $body -UseBasicParsing

    if ($response.Content -match "sentiment|themes") {
        Write-Host "✅ Review analysis endpoint working" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Review analysis returned unexpected response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Review analysis test failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ AI Service Testing Complete!" -ForegroundColor Green

