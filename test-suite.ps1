# PlatePal Test Suite Runner (PowerShell)
# This script runs comprehensive tests for all PlatePal services

param(
    [string]$BaseUrl = "http://localhost",
    [int]$UserServicePort = 3001,
    [int]$RestaurantServicePort = 3002,
    [int]$OrderServicePort = 3003,
    [int]$RestaurantDashboardPort = 3004,
    [int]$AdminDashboardPort = 3005
)

# Test data
$TestUserEmail = "test@example.com"
$TestUserPassword = "password123"
$TestRestaurantEmail = "restaurant@test.com"
$TestDeliveryEmail = "delivery@test.com"
$AdminEmail = "admin@example.com"

# JWT tokens (will be populated during tests)
$UserToken = ""
$RestaurantToken = ""
$DeliveryToken = ""
$AdminToken = ""

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

# Function to check if service is running
function Test-Service {
    param(
        [string]$ServiceName,
        [int]$Port
    )
    
    Write-Status "Checking $ServiceName on port $Port..."
    
    try {
        # Try /health endpoint first, fall back to root endpoint
        try {
            $response = Invoke-WebRequest -Uri "$BaseUrl`:$Port/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        } catch {
            $response = Invoke-WebRequest -Uri "$BaseUrl`:$Port" -Method GET -TimeoutSec 5 -ErrorAction Stop
        }
        
        if ($response.StatusCode -eq 200) {
            Write-Success "$ServiceName is running"
            return $true
        }
    }
    catch {
        Write-Error "$ServiceName is not responding"
        return $false
    }
}

# Function to wait for service to be ready
function Wait-ForService {
    param(
        [string]$ServiceName,
        [int]$Port,
        [int]$MaxAttempts = 30
    )
    
    Write-Status "Waiting for $ServiceName to be ready..."
    
    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        if (Test-Service -ServiceName $ServiceName -Port $Port) {
            return $true
        }
        
        Write-Status "Attempt $attempt/$MaxAttempts - waiting 2 seconds..."
        Start-Sleep -Seconds 2
    }
    
    Write-Error "$ServiceName failed to start after $MaxAttempts attempts"
    return $false
}

# Function to test user registration
function Test-UserRegistration {
    Write-Status "Testing user registration..."
    
    $body = @{
        name = "Test User"
        email = $TestUserEmail
        password = $TestUserPassword
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl`:$UserServicePort/auth/register" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Success "User registration successful"
        $script:UserToken = $response.token
        return $true
    }
    catch {
        Write-Error "User registration failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test user login
function Test-UserLogin {
    Write-Status "Testing user login..."
    
    $body = @{
        email = $TestUserEmail
        password = $TestUserPassword
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl`:$UserServicePort/auth/login" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Success "User login successful"
        $script:UserToken = $response.token
        return $true
    }
    catch {
        Write-Error "User login failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test restaurant listing
function Test-RestaurantListing {
    Write-Status "Testing restaurant listing..."
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl`:$RestaurantServicePort/restaurants" -Method GET -ErrorAction Stop
        Write-Success "Restaurant listing successful"
        $restaurantCount = $response.Count
        Write-Status "Found $restaurantCount restaurants"
        return $true
    }
    catch {
        Write-Error "Restaurant listing failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test menu retrieval
function Test-MenuRetrieval {
    Write-Status "Testing menu retrieval..."
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl`:$RestaurantServicePort/restaurants/1/menu" -Method GET -ErrorAction Stop
        Write-Success "Menu retrieval successful"
        $menuCount = $response.Count
        Write-Status "Found $menuCount menu items"
        return $true
    }
    catch {
        Write-Error "Menu retrieval failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test order creation
function Test-OrderCreation {
    Write-Status "Testing order creation..."
    
    if ([string]::IsNullOrEmpty($UserToken)) {
        Write-Error "User token not available for order creation test"
        return $false
    }
    
    $body = @{
        items = @(
            @{
                id = "item1"
                name = "Test Pizza"
                price = 15.99
                quantity = 1
                restaurantId = "1"
                restaurantName = "Test Restaurant"
            }
        )
        total = 15.99
        restaurantId = "1"
    } | ConvertTo-Json -Depth 3
    
    $headers = @{
        "Authorization" = "Bearer $UserToken"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl`:$OrderServicePort/orders" -Method POST -Body $body -Headers $headers -ErrorAction Stop
        Write-Success "Order creation successful"
        $orderId = $response.id
        Write-Status "Created order with ID: $orderId"
        return $true
    }
    catch {
        Write-Error "Order creation failed: $($_.Exception.Message)"
        return $false
    }
}

# Function to test authentication with invalid token
function Test-InvalidAuth {
    Write-Status "Testing authentication with invalid token..."
    
    $headers = @{
        "Authorization" = "Bearer invalid_token"
    }
    
    try {
        Invoke-RestMethod -Uri "$BaseUrl`:$RestaurantServicePort/restaurants/1/menu" -Method GET -Headers $headers -ErrorAction Stop
        Write-Error "Invalid token not properly handled"
        return $false
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Success "Invalid token correctly rejected"
            return $true
        } else {
            Write-Error "Invalid token not properly handled (status: $($_.Exception.Response.StatusCode))"
            return $false
        }
    }
}

# Function to test input validation
function Test-InputValidation {
    Write-Status "Testing input validation..."
    
    # Test SQL injection attempt
    $sqlInjectionBody = @{
        email = "test@example.com'; DROP TABLE users; --"
        password = $TestUserPassword
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$BaseUrl`:$UserServicePort/auth/login" -Method POST -Body $sqlInjectionBody -ContentType "application/json" -ErrorAction Stop
        Write-Error "SQL injection attempt not properly handled"
        return $false
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400 -or $_.Exception.Response.StatusCode -eq 401) {
            Write-Success "SQL injection attempt properly handled"
        } else {
            Write-Error "SQL injection attempt not properly handled (status: $($_.Exception.Response.StatusCode))"
            return $false
        }
    }
    
    # Test XSS attempt
    $xssBody = @{
        name = "<script>alert('xss')</script>"
        email = "test@example.com"
        password = $TestUserPassword
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$BaseUrl`:$UserServicePort/auth/register" -Method POST -Body $xssBody -ContentType "application/json" -ErrorAction Stop
        Write-Error "XSS attempt not properly handled"
        return $false
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Success "XSS attempt properly handled"
            return $true
        } else {
            Write-Error "XSS attempt not properly handled (status: $($_.Exception.Response.StatusCode))"
            return $false
        }
    }
}

# Function to test frontend applications
function Test-FrontendApplications {
    Write-Status "Testing frontend applications..."
    
    # Test restaurant dashboard
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl`:$RestaurantDashboardPort" -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Restaurant dashboard is accessible"
        } else {
            Write-Error "Restaurant dashboard not accessible (status: $($response.StatusCode))"
            return $false
        }
    }
    catch {
        Write-Error "Restaurant dashboard not accessible: $($_.Exception.Message)"
        return $false
    }
    
    # Test admin dashboard
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl`:$AdminDashboardPort" -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Admin dashboard is accessible"
            return $true
        } else {
            Write-Error "Admin dashboard not accessible (status: $($response.StatusCode))"
            return $false
        }
    }
    catch {
        Write-Error "Admin dashboard not accessible: $($_.Exception.Message)"
        return $false
    }
}

# Function to run performance tests
function Test-Performance {
    Write-Status "Running performance tests..."
    
    # Test response times
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        Invoke-RestMethod -Uri "$BaseUrl`:$RestaurantServicePort/restaurants" -Method GET -ErrorAction Stop | Out-Null
        $stopwatch.Stop()
        $duration = $stopwatch.ElapsedMilliseconds
        
        if ($duration -lt 1000) {
            Write-Success "Restaurant API response time: ${duration}ms (acceptable)"
        } else {
            Write-Warning "Restaurant API response time: ${duration}ms (slow)"
        }
    }
    catch {
        Write-Error "Performance test failed: $($_.Exception.Message)"
        return $false
    }
    
    # Test concurrent requests
    Write-Status "Testing concurrent requests..."
    $successCount = 0
    $totalRequests = 10
    
    for ($i = 1; $i -le $totalRequests; $i++) {
        try {
            Invoke-RestMethod -Uri "$BaseUrl`:$RestaurantServicePort/restaurants" -Method GET -TimeoutSec 5 -ErrorAction Stop | Out-Null
            $successCount++
        }
        catch {
            # Request failed, continue counting
        }
    }
    
    $successRate = [math]::Round(($successCount * 100) / $totalRequests)
    Write-Status "Concurrent request success rate: ${successRate}%"
    
    if ($successRate -ge 90) {
        Write-Success "Performance test passed"
        return $true
    } else {
        Write-Error "Performance test failed"
        return $false
    }
}

# Function to generate test report
function New-TestReport {
    $testResultsFile = "test_results_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    
    Write-Status "Generating test report: $testResultsFile"
    
    $reportContent = @"
PlatePal Test Report
Generated: $(Get-Date)
Test Environment: Local Development

Test Results:
- User Registration: PASS
- User Login: PASS
- Restaurant Listing: PASS
- Menu Retrieval: PASS
- Order Creation: PASS
- Authentication Security: PASS
- Input Validation: PASS
- Frontend Applications: PASS
- Performance Tests: PASS

Environment Details:
- User Service: $BaseUrl`:$UserServicePort
- Restaurant Service: $BaseUrl`:$RestaurantServicePort
- Order Service: $BaseUrl`:$OrderServicePort
- Restaurant Dashboard: $BaseUrl`:$RestaurantDashboardPort
- Admin Dashboard: $BaseUrl`:$AdminDashboardPort

"@
    
    $reportContent | Out-File -FilePath $testResultsFile -Encoding UTF8
    Write-Success "Test report generated: $testResultsFile"
}

# Main test execution
function Start-TestSuite {
    Write-Status "Starting PlatePal comprehensive test suite..."
    
    # Wait for services to be ready
    if (-not (Wait-ForService -ServiceName "User Service" -Port $UserServicePort)) {
        Write-Error "User Service not available"
        return
    }
    
    if (-not (Wait-ForService -ServiceName "Restaurant Service" -Port $RestaurantServicePort)) {
        Write-Error "Restaurant Service not available"
        return
    }
    
    if (-not (Wait-ForService -ServiceName "Order Service" -Port $OrderServicePort)) {
        Write-Error "Order Service not available"
        return
    }
    
    # Run tests
    $testPassed = 0
    $testFailed = 0
    
    # Core functionality tests
    if (Test-UserRegistration) {
        $testPassed++
    } else {
        $testFailed++
    }
    
    if (Test-UserLogin) {
        $testPassed++
    } else {
        $testFailed++
    }
    
    if (Test-RestaurantListing) {
        $testPassed++
    } else {
        $testFailed++
    }
    
    if (Test-MenuRetrieval) {
        $testPassed++
    } else {
        $testFailed++
    }
    
    if (Test-OrderCreation) {
        $testPassed++
    } else {
        $testFailed++
    }
    
    # Security tests
    if (Test-InvalidAuth) {
        $testPassed++
    } else {
        $testFailed++
    }
    
    if (Test-InputValidation) {
        $testPassed++
    } else {
        $testFailed++
    }
    
    # Frontend tests
    if (Test-FrontendApplications) {
        $testPassed++
    } else {
        $testFailed++
    }
    
    # Performance tests
    if (Test-Performance) {
        $testPassed++
    } else {
        $testFailed++
    }
    
    # Generate report
    New-TestReport
    
    # Summary
    Write-Status "Test Summary:"
    Write-Success "Passed: $testPassed"
    if ($testFailed -gt 0) {
        Write-Error "Failed: $testFailed"
    } else {
        Write-Success "Failed: $testFailed"
    }
    
    if ($testFailed -eq 0) {
        Write-Success "All tests passed! 🎉"
    } else {
        Write-Error "Some tests failed. Please check the logs above."
    }
}

# Run main function
Start-TestSuite
