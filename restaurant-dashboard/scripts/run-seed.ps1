# Restaurant Seeding Script Runner
# PowerShell script to execute the TypeScript seeding script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restaurant Dashboard Seeding" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the restaurant-dashboard directory" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if axios is installed (required by seeding script)
$hasAxios = npm list axios 2>&1 | Select-String "axios@"
if (-Not $hasAxios) {
    Write-Host "Installing axios..." -ForegroundColor Yellow
    npm install --save-dev axios @types/node
}

Write-Host ""
Write-Host "Starting seeding process..." -ForegroundColor Green
Write-Host "This will create 10+ restaurants with 15-20 dishes each" -ForegroundColor Yellow
Write-Host ""

# Run the seeding script using ts-node or tsx
if (Get-Command tsx -ErrorAction SilentlyContinue) {
    tsx scripts/seed-restaurants.ts
} elseif (Get-Command ts-node -ErrorAction SilentlyContinue) {
    ts-node scripts/seed-restaurants.ts
} else {
    Write-Host "Installing tsx for running TypeScript..." -ForegroundColor Yellow
    npm install --save-dev tsx
    npx tsx scripts/seed-restaurants.ts
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check RESTAURANT_CREDENTIALS.md for login details" -ForegroundColor Yellow

