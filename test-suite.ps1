# PlatePal Comprehensive Test Suite Runner (PowerShell)
# Updated for Phase 1-6: Includes WebSocket, RBAC, Real-time Features, Docker

param(
    [string]$BaseUrl = "http://localhost",
    [int]$UserServicePort = 3001,
    [int]$RestaurantServicePort = 3002,
    [int]$OrderServicePort = 3003,
    [int]$RestaurantDashboardPort = 3004,
    [int]$AdminDashboardPort = 3005,
    [int]$CustomerWebPort = 3006,
    [int]$DeliveryWebPort = 3007
)

# WebSocket URLs
$WsOrderService = "ws://localhost:3003"

# Test results
$script:TestsPassed = 0
$script:TestsFailed = 0
$script:TestsTotal = 0

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
    $script:TestsPassed++
    $script:TestsTotal++
}

function Write-Error {
    param([string]$Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
    $script:TestsFailed++
    $script:TestsTotal++
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

# Function to check if service is running
function Test-Service {
    param(
        [string]$ServiceName,
        [string]$Url,
        [int]$Port
    )
    
    Write-Status "Checking $ServiceName on port $Port..."
    
    try {
        $response = Invoke-WebRequest -Uri "$Url`:$Port/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "$ServiceName is running"
            return $true
        }
    }
    catch {
        try {
            $response = Invoke-WebRequest -Uri "$Url`:$Port" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 404) {
                Write-Success "$ServiceName is running"
                return $true
            }
        }
        catch {
            Write-Error "$ServiceName is not responding"
            return $false
        }
    }
    return $false
}

# Function to test API endpoint
function Test-ApiEndpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [int]$ExpectedCode,
        [hashtable]$Headers = @{}
    )
    
    Write-Status "Testing $Name..."
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            TimeoutSec = 5
            ErrorAction = "Stop"
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        $response = Invoke-WebRequest @params
        if ($response.StatusCode -eq $ExpectedCode) {
            Write-Success "$Name returns $ExpectedCode"
            return $true
        }
        else {
            Write-Error "$Name returned $($response.StatusCode) (expected $ExpectedCode)"
            return $false
        }
    }
    catch {
        Write-Error "$Name failed: $($_.Exception.Message)"
        return $false
    }
}

# Check Docker services
function Test-DockerServices {
    Write-Section "Checking Docker Services"
    
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        Write-Status "Checking Docker Compose services..."
        
        $services = docker-compose ps 2>&1
        if ($services -match "Up") {
            Write-Success "Docker services are running"
            
            # Check each service
            Test-Service "User Service" $BaseUrl $UserServicePort | Out-Null
            Test-Service "Restaurant Service" $BaseUrl $RestaurantServicePort | Out-Null
            Test-Service "Order Service" $BaseUrl $OrderServicePort | Out-Null
            Test-Service "Restaurant Dashboard" $BaseUrl $RestaurantDashboardPort | Out-Null
            Test-Service "Admin Dashboard" $BaseUrl $AdminDashboardPort | Out-Null
            Test-Service "Customer Web" $BaseUrl $CustomerWebPort | Out-Null
            Test-Service "Delivery Web" $BaseUrl $DeliveryWebPort | Out-Null
        }
        else {
            Write-Warning "Docker services may not be running. Start with: docker-compose up -d"
        }
    }
    else {
        Write-Warning "docker-compose not found. Skipping Docker service checks."
    }
}

# Test Backend Services
function Test-BackendServices {
    Write-Section "Testing Backend Services"
    
    Test-ApiEndpoint "User Service Health" "GET" "$BaseUrl`:$UserServicePort/health" 200 | Out-Null
    Test-ApiEndpoint "Restaurant Service Health" "GET" "$BaseUrl`:$RestaurantServicePort/health" 200 | Out-Null
    Test-ApiEndpoint "Order Service Health" "GET" "$BaseUrl`:$OrderServicePort/health" 200 | Out-Null
}

# Test Frontend Services
function Test-FrontendServices {
    Write-Section "Testing Frontend Services"
    
    Test-ApiEndpoint "Restaurant Dashboard" "GET" "$BaseUrl`:$RestaurantDashboardPort" 200 | Out-Null
    Test-ApiEndpoint "Admin Dashboard" "GET" "$BaseUrl`:$AdminDashboardPort" 200 | Out-Null
    Test-ApiEndpoint "Customer Web" "GET" "$BaseUrl`:$CustomerWebPort" 200 | Out-Null
    Test-ApiEndpoint "Delivery Web" "GET" "$BaseUrl`:$DeliveryWebPort" 200 | Out-Null
}

# Test Docker Configuration
function Test-DockerConfig {
    Write-Section "Testing Docker Configuration"
    
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Write-Status "Checking Docker installation..."
        
        if (Test-Path "docker-compose.yml") {
            Write-Success "docker-compose.yml found"
            
            try {
                docker-compose config 2>&1 | Out-Null
                Write-Success "docker-compose.yml is valid"
            }
            catch {
                Write-Error "docker-compose.yml has syntax errors"
            }
        }
        else {
            Write-Error "docker-compose.yml not found"
        }
        
        # Check Dockerfile existence
        $dockerfiles = @(
            "customer-web/Dockerfile",
            "restaurant-dashboard/Dockerfile",
            "delivery-web/Dockerfile",
            "admin-dashboard/Dockerfile",
            "backend/user-service/Dockerfile",
            "backend/restaurant-service/Dockerfile",
            "backend/order-service/Dockerfile"
        )
        
        foreach ($dockerfile in $dockerfiles) {
            if (Test-Path $dockerfile) {
                Write-Success "$dockerfile exists"
            }
            else {
                Write-Error "$dockerfile not found"
            }
        }
    }
    else {
        Write-Warning "Docker not installed. Skipping Docker configuration tests."
    }
}

# Test WebSocket Integration
function Test-WebSocketIntegration {
    Write-Section "Testing WebSocket Integration"
    
    $wsFiles = @(
        "customer-web/lib/websocket.ts",
        "restaurant-dashboard/lib/websocket.ts",
        "delivery-web/lib/websocket.ts",
        "admin-dashboard/src/lib/websocket.ts"
    )
    
    foreach ($wsFile in $wsFiles) {
        if (Test-Path $wsFile) {
            Write-Success "WebSocket client found: $wsFile"
        }
        else {
            Write-Error "WebSocket client not found: $wsFile"
        }
    }
    
    if (Test-Path "backend/order-service/src/orders/orders.gateway.ts") {
        Write-Success "WebSocket gateway found"
    }
    else {
        Write-Error "WebSocket gateway not found"
    }
}

# Test Currency Formatting
function Test-CurrencyFormatting {
    Write-Section "Testing Currency Formatting"
    
    Write-Status "Checking for INR currency formatting..."
    
    $files = Get-ChildItem -Path "customer-web", "restaurant-dashboard" -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notmatch "node_modules|dist|\.next" } |
        Select-String -Pattern "formatINR|INR" -SimpleMatch
    
    if ($files) {
        Write-Success "INR currency formatting found in codebase"
    }
    else {
        Write-Warning "INR currency formatting may not be implemented"
    }
}

# Test RBAC Implementation
function Test-RbacImplementation {
    Write-Section "Testing RBAC Implementation"
    
    if (Test-Path "admin-dashboard/src/lib/rbac.ts") {
        Write-Success "RBAC utility found"
    }
    else {
        Write-Error "RBAC utility not found"
    }
    
    $rbacPages = @(
        "admin-dashboard/src/app/approvals",
        "admin-dashboard/src/app/tickets",
        "admin-dashboard/src/app/analytics"
    )
    
    foreach ($page in $rbacPages) {
        if (Test-Path $page) {
            Write-Success "RBAC-protected page found: $page"
        }
        else {
            Write-Error "RBAC-protected page not found: $page"
        }
    }
}

# Test New Features
function Test-NewFeatures {
    Write-Section "Testing New Features"
    
    $features = @{
        "Photo Capture" = "delivery-web/components/PhotoCapture.tsx"
        "Signature Capture" = "delivery-web/components/SignatureCapture.tsx"
        "Availability Toggle" = "delivery-web/components/AvailabilityToggle.tsx"
        "Earnings Dashboard" = "delivery-web/app/earnings/page.tsx"
        "DataTable Component" = "admin-dashboard/src/components/DataTable.tsx"
        "Modal Component" = "admin-dashboard/src/components/Modal.tsx"
        "Restaurant Filters" = "customer-web/components/RestaurantFilters.tsx"
    }
    
    foreach ($feature in $features.GetEnumerator()) {
        if (Test-Path $feature.Value) {
            Write-Success "$($feature.Key) component found"
        }
        else {
            Write-Error "$($feature.Key) component not found"
        }
    }
}

# Test Error Handling
function Test-ErrorHandling {
    Write-Section "Testing Error Handling"
    
    $errorFiles = @(
        "customer-web/components/ErrorBoundary.tsx",
        "restaurant-dashboard/app/components/ErrorBoundary.tsx",
        "delivery-web/components/ErrorBoundary.tsx",
        "admin-dashboard/src/components/ErrorBoundary.tsx"
    )
    
    foreach ($errorFile in $errorFiles) {
        if (Test-Path $errorFile) {
            Write-Success "ErrorBoundary found: $errorFile"
        }
        else {
            Write-Error "ErrorBoundary not found: $errorFile"
        }
    }
    
    if (Test-Path "customer-web/lib/error-handler.ts") {
        Write-Success "Error handler utility found"
    }
    else {
        Write-Error "Error handler utility not found"
    }
}

# Test Accessibility
function Test-Accessibility {
    Write-Section "Testing Accessibility"
    
    if (Test-Path "customer-web/lib/accessibility.ts") {
        Write-Success "Accessibility utilities found"
    }
    else {
        Write-Error "Accessibility utilities not found"
    }
    
    if (Test-Path "customer-web/components/AccessibleButton.tsx") {
        Write-Success "AccessibleButton component found"
    }
    else {
        Write-Error "AccessibleButton component not found"
    }
    
    $layoutFiles = @(
        "customer-web/app/layout.tsx",
        "restaurant-dashboard/app/layout.tsx",
        "delivery-web/app/layout.tsx",
        "admin-dashboard/src/app/layout.tsx"
    )
    
    $skipLinksFound = $false
    foreach ($layout in $layoutFiles) {
        if (Test-Path $layout) {
            $content = Get-Content $layout -Raw
            if ($content -match "skip.*content|skip.*main") {
                $skipLinksFound = $true
                break
            }
        }
    }
    
    if ($skipLinksFound) {
        Write-Success "Skip to content links found"
    }
    else {
        Write-Warning "Skip to content links may not be implemented"
    }
}

# Main test execution
function Main {
    Write-Host ""
    Write-Section "PlatePal Comprehensive Test Suite"
    Write-Host "Testing all services and features..."
    Write-Host ""
    
    # Run all test suites
    Test-DockerServices
    Test-BackendServices
    Test-FrontendServices
    Test-DockerConfig
    Test-WebSocketIntegration
    Test-CurrencyFormatting
    Test-RbacImplementation
    Test-NewFeatures
    Test-ErrorHandling
    Test-Accessibility
    
    # Print summary
    Write-Host ""
    Write-Section "Test Summary"
    Write-Host "Tests Passed: $script:TestsPassed" -ForegroundColor Green
    Write-Host "Tests Failed: $script:TestsFailed" -ForegroundColor Red
    Write-Host "Total Tests: $script:TestsTotal" -ForegroundColor Blue
    Write-Host ""
    
    if ($script:TestsFailed -eq 0) {
        Write-Success "All tests passed!"
        exit 0
    }
    else {
        Write-Error "Some tests failed. Please review the output above."
        exit 1
    }
}

# Run main function
Main
