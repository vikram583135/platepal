#!/bin/bash

# PlatePal Comprehensive Test Suite Runner
# Updated for Phase 1-6: Includes WebSocket, RBAC, Real-time Features, Docker

set -e

echo "🧪 Starting PlatePal Comprehensive Test Suite..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="http://localhost"
USER_SERVICE_PORT="3001"
RESTAURANT_SERVICE_PORT="3002"
ORDER_SERVICE_PORT="3003"
RESTAURANT_DASHBOARD_PORT="3004"
ADMIN_DASHBOARD_PORT="3005"
CUSTOMER_WEB_PORT="3006"
DELIVERY_WEB_PORT="3007"

# WebSocket URLs
WS_ORDER_SERVICE="ws://localhost:3003"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_section() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local url=$2
    local port=$3
    
    print_status "Checking $service_name on port $port..."
    
    if curl -f -s -o /dev/null "$url:$port/health" 2>/dev/null || curl -f -s -o /dev/null "$url:$port" 2>/dev/null; then
        print_success "$service_name is running"
        return 0
    else
        print_error "$service_name is not responding"
        return 1
    fi
}

# Function to check Docker services
check_docker_services() {
    print_section "Checking Docker Services"
    
    if command -v docker-compose &> /dev/null; then
        print_status "Checking Docker Compose services..."
        
        if docker-compose ps | grep -q "Up"; then
            print_success "Docker services are running"
            
            # Check each service
            check_service "User Service" "$BASE_URL" "$USER_SERVICE_PORT" || true
            check_service "Restaurant Service" "$BASE_URL" "$RESTAURANT_SERVICE_PORT" || true
            check_service "Order Service" "$BASE_URL" "$ORDER_SERVICE_PORT" || true
            check_service "Restaurant Dashboard" "$BASE_URL" "$RESTAURANT_DASHBOARD_PORT" || true
            check_service "Admin Dashboard" "$BASE_URL" "$ADMIN_DASHBOARD_PORT" || true
            check_service "Customer Web" "$BASE_URL" "$CUSTOMER_WEB_PORT" || true
            check_service "Delivery Web" "$BASE_URL" "$DELIVERY_WEB_PORT" || true
        else
            print_warning "Docker services may not be running. Start with: docker-compose up -d"
        fi
    else
        print_warning "docker-compose not found. Skipping Docker service checks."
    fi
}

# Function to test API endpoint
test_api_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local expected_code=$4
    local headers=$5
    
    print_status "Testing $name..."
    
    if [ -z "$headers" ]; then
        response_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" 2>/dev/null || echo "000")
    else
        response_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "$headers" "$url" 2>/dev/null || echo "000")
    fi
    
    if [ "$response_code" = "$expected_code" ]; then
        print_success "$name returns $expected_code"
        return 0
    else
        print_error "$name returned $response_code (expected $expected_code)"
        return 1
    fi
}

# Function to test WebSocket endpoint (basic check)
test_websocket_endpoint() {
    local name=$1
    local url=$2
    
    print_status "Testing WebSocket endpoint: $name..."
    
    # Use wscat if available, otherwise just check if port is open
    if command -v wscat &> /dev/null; then
        if timeout 2 wscat -c "$url" &>/dev/null; then
            print_success "$name WebSocket endpoint is accessible"
            return 0
        else
            print_error "$name WebSocket endpoint is not accessible"
            return 1
        fi
    else
        print_warning "wscat not installed. Skipping WebSocket connection test."
        print_status "Install with: npm install -g wscat"
        return 0
    fi
}

# Test Backend Services
test_backend_services() {
    print_section "Testing Backend Services"
    
    # User Service
    test_api_endpoint "User Service Health" "GET" "$BASE_URL:$USER_SERVICE_PORT/health" "200" || true
    
    # Restaurant Service
    test_api_endpoint "Restaurant Service Health" "GET" "$BASE_URL:$RESTAURANT_SERVICE_PORT/health" "200" || true
    
    # Order Service
    test_api_endpoint "Order Service Health" "GET" "$BASE_URL:$ORDER_SERVICE_PORT/health" "200" || true
    
    # WebSocket endpoints
    test_websocket_endpoint "Order Service" "$WS_ORDER_SERVICE/socket.io/?EIO=4&transport=websocket" || true
}

# Test Frontend Services
test_frontend_services() {
    print_section "Testing Frontend Services"
    
    # Restaurant Dashboard
    test_api_endpoint "Restaurant Dashboard" "GET" "$BASE_URL:$RESTAURANT_DASHBOARD_PORT" "200" || test_api_endpoint "Restaurant Dashboard" "GET" "$BASE_URL:$RESTAURANT_DASHBOARD_PORT" "404" || true
    
    # Admin Dashboard
    test_api_endpoint "Admin Dashboard" "GET" "$BASE_URL:$ADMIN_DASHBOARD_PORT" "200" || test_api_endpoint "Admin Dashboard" "GET" "$BASE_URL:$ADMIN_DASHBOARD_PORT" "404" || true
    
    # Customer Web
    test_api_endpoint "Customer Web" "GET" "$BASE_URL:$CUSTOMER_WEB_PORT" "200" || test_api_endpoint "Customer Web" "GET" "$BASE_URL:$CUSTOMER_WEB_PORT" "404" || true
    
    # Delivery Web
    test_api_endpoint "Delivery Web" "GET" "$BASE_URL:$DELIVERY_WEB_PORT" "200" || test_api_endpoint "Delivery Web" "GET" "$BASE_URL:$DELIVERY_WEB_PORT" "404" || true
}

# Test Docker Configuration
test_docker_config() {
    print_section "Testing Docker Configuration"
    
    if command -v docker &> /dev/null; then
        print_status "Checking Docker installation..."
        
        # Check if docker-compose.yml exists
        if [ -f "docker-compose.yml" ]; then
            print_success "docker-compose.yml found"
            
            # Validate docker-compose.yml
            if docker-compose config &> /dev/null; then
                print_success "docker-compose.yml is valid"
            else
                print_error "docker-compose.yml has syntax errors"
            fi
        else
            print_error "docker-compose.yml not found"
        fi
        
        # Check Dockerfile existence
        local dockerfiles=(
            "customer-web/Dockerfile"
            "restaurant-dashboard/Dockerfile"
            "delivery-web/Dockerfile"
            "admin-dashboard/Dockerfile"
            "backend/user-service/Dockerfile"
            "backend/restaurant-service/Dockerfile"
            "backend/order-service/Dockerfile"
        )
        
        for dockerfile in "${dockerfiles[@]}"; do
            if [ -f "$dockerfile" ]; then
                print_success "$dockerfile exists"
            else
                print_error "$dockerfile not found"
            fi
        done
    else
        print_warning "Docker not installed. Skipping Docker configuration tests."
    fi
}

# Test Currency Formatting (INR)
test_currency_formatting() {
    print_section "Testing Currency Formatting"
    
    print_status "Checking for INR currency formatting..."
    
    # Check frontend code for INR formatting
    if grep -r "formatINR\|INR\|₹" customer-web/lib utils.ts restaurant-dashboard/lib restaurant-dashboard/app 2>/dev/null | grep -v node_modules | head -1 &>/dev/null; then
        print_success "INR currency formatting found in codebase"
    else
        print_warning "INR currency formatting may not be implemented"
    fi
}

# Test WebSocket Integration
test_websocket_integration() {
    print_section "Testing WebSocket Integration"
    
    # Check for WebSocket client files
    local ws_files=(
        "customer-web/lib/websocket.ts"
        "restaurant-dashboard/lib/websocket.ts"
        "delivery-web/lib/websocket.ts"
        "admin-dashboard/src/lib/websocket.ts"
    )
    
    for ws_file in "${ws_files[@]}"; do
        if [ -f "$ws_file" ]; then
            print_success "WebSocket client found: $ws_file"
        else
            print_error "WebSocket client not found: $ws_file"
        fi
    done
    
    # Check for WebSocket gateway
    if [ -f "backend/order-service/src/orders/orders.gateway.ts" ]; then
        print_success "WebSocket gateway found"
    else
        print_error "WebSocket gateway not found"
    fi
}

# Test RBAC Implementation
test_rbac_implementation() {
    print_section "Testing RBAC Implementation"
    
    # Check for RBAC utility
    if [ -f "admin-dashboard/src/lib/rbac.ts" ]; then
        print_success "RBAC utility found"
    else
        print_error "RBAC utility not found"
    fi
    
    # Check for RBAC-protected pages
    local rbac_pages=(
        "admin-dashboard/src/app/approvals"
        "admin-dashboard/src/app/tickets"
        "admin-dashboard/src/app/analytics"
    )
    
    for page in "${rbac_pages[@]}"; do
        if [ -d "$page" ]; then
            print_success "RBAC-protected page found: $page"
        else
            print_error "RBAC-protected page not found: $page"
        fi
    done
}

# Test New Features
test_new_features() {
    print_section "Testing New Features"
    
    # Photo Capture
    if [ -f "delivery-web/components/PhotoCapture.tsx" ]; then
        print_success "Photo Capture component found"
    else
        print_error "Photo Capture component not found"
    fi
    
    # Signature Capture
    if [ -f "delivery-web/components/SignatureCapture.tsx" ]; then
        print_success "Signature Capture component found"
    else
        print_error "Signature Capture component not found"
    fi
    
    # Availability Toggle
    if [ -f "delivery-web/components/AvailabilityToggle.tsx" ]; then
        print_success "Availability Toggle component found"
    else
        print_error "Availability Toggle component not found"
    fi
    
    # Earnings Dashboard
    if [ -f "delivery-web/app/earnings/page.tsx" ]; then
        print_success "Earnings Dashboard found"
    else
        print_error "Earnings Dashboard not found"
    fi
    
    # DataTable Component
    if [ -f "admin-dashboard/src/components/DataTable.tsx" ]; then
        print_success "DataTable component found"
    else
        print_error "DataTable component not found"
    fi
    
    # Modal Component
    if [ -f "admin-dashboard/src/components/Modal.tsx" ]; then
        print_success "Modal component found"
    else
        print_error "Modal component not found"
    fi
    
    # Restaurant Filters
    if [ -f "customer-web/components/RestaurantFilters.tsx" ]; then
        print_success "Restaurant Filters component found"
    else
        print_error "Restaurant Filters component not found"
    fi
}

# Test Error Handling
test_error_handling() {
    print_section "Testing Error Handling"
    
    local error_files=(
        "customer-web/components/ErrorBoundary.tsx"
        "restaurant-dashboard/app/components/ErrorBoundary.tsx"
        "delivery-web/components/ErrorBoundary.tsx"
        "admin-dashboard/src/components/ErrorBoundary.tsx"
    )
    
    for error_file in "${error_files[@]}"; do
        if [ -f "$error_file" ]; then
            print_success "ErrorBoundary found: $error_file"
        else
            print_error "ErrorBoundary not found: $error_file"
        fi
    done
    
    # Check for error handler utilities
    if [ -f "customer-web/lib/error-handler.ts" ]; then
        print_success "Error handler utility found"
    else
        print_error "Error handler utility not found"
    fi
}

# Test Accessibility
test_accessibility() {
    print_section "Testing Accessibility"
    
    # Check for accessibility utilities
    if [ -f "customer-web/lib/accessibility.ts" ]; then
        print_success "Accessibility utilities found"
    else
        print_error "Accessibility utilities not found"
    fi
    
    # Check for AccessibleButton
    if [ -f "customer-web/components/AccessibleButton.tsx" ]; then
        print_success "AccessibleButton component found"
    else
        print_error "AccessibleButton component not found"
    fi
    
    # Check for skip links in layouts
    if grep -r "skip.*content\|skip.*main" customer-web/app/layout.tsx restaurant-dashboard/app/layout.tsx delivery-web/app/layout.tsx admin-dashboard/src/app/layout.tsx 2>/dev/null | head -1 &>/dev/null; then
        print_success "Skip to content links found"
    else
        print_warning "Skip to content links may not be implemented"
    fi
}

# Main test execution
main() {
    echo ""
    print_section "PlatePal Comprehensive Test Suite"
    echo "Testing all services and features..."
    echo ""
    
    # Run all test suites
    check_docker_services
    test_backend_services
    test_frontend_services
    test_docker_config
    test_websocket_integration
    test_currency_formatting
    test_rbac_implementation
    test_new_features
    test_error_handling
    test_accessibility
    
    # Print summary
    echo ""
    print_section "Test Summary"
    echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
    echo -e "${BLUE}Total Tests: $TESTS_TOTAL${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "All tests passed! ✅"
        exit 0
    else
        print_error "Some tests failed. Please review the output above."
        exit 1
    fi
}

# Run main function
main
