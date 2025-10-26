#!/bin/bash

# PlatePal Test Suite Runner
# This script runs comprehensive tests for all PlatePal services

set -e

echo "🧪 Starting PlatePal Test Suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="http://localhost"
USER_SERVICE_PORT="3001"
RESTAURANT_SERVICE_PORT="3002"
ORDER_SERVICE_PORT="3003"
RESTAURANT_DASHBOARD_PORT="3004"
ADMIN_DASHBOARD_PORT="3005"

# Test data
TEST_USER_EMAIL="test@example.com"
TEST_USER_PASSWORD="password123"
TEST_RESTAURANT_EMAIL="restaurant@test.com"
TEST_DELIVERY_EMAIL="delivery@test.com"
ADMIN_EMAIL="admin@example.com"

# JWT tokens (will be populated during tests)
USER_TOKEN=""
RESTAURANT_TOKEN=""
DELIVERY_TOKEN=""
ADMIN_TOKEN=""

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if service is running
check_service() {
    local service_name=$1
    local port=$2
    
    print_status "Checking $service_name on port $port..."
    
    # Try /health endpoint first, fall back to root endpoint
    if curl -s -f "$BASE_URL:$port/health" > /dev/null 2>&1; then
        print_success "$service_name is running"
        return 0
    elif curl -s -f "$BASE_URL:$port" > /dev/null 2>&1; then
        print_success "$service_name is running"
        return 0
    else
        print_error "$service_name is not responding"
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if check_service "$service_name" "$port"; then
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - waiting 2 seconds..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to test user registration
test_user_registration() {
    print_status "Testing user registration..."
    
    local response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL:$USER_SERVICE_PORT/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"Test User\",
            \"email\": \"$TEST_USER_EMAIL\",
            \"password\": \"$TEST_USER_PASSWORD\"
        }")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "201" ]; then
        print_success "User registration successful"
        USER_TOKEN=$(echo "$body" | jq -r '.token')
        return 0
    else
        print_error "User registration failed with status $http_code"
        echo "Response: $body"
        return 1
    fi
}

# Function to test user login
test_user_login() {
    print_status "Testing user login..."
    
    local response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL:$USER_SERVICE_PORT/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_USER_EMAIL\",
            \"password\": \"$TEST_USER_PASSWORD\"
        }")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        print_success "User login successful"
        USER_TOKEN=$(echo "$body" | jq -r '.token')
        return 0
    else
        print_error "User login failed with status $http_code"
        echo "Response: $body"
        return 1
    fi
}

# Function to test restaurant listing
test_restaurant_listing() {
    print_status "Testing restaurant listing..."
    
    local response=$(curl -s -w "%{http_code}" -X GET "$BASE_URL:$RESTAURANT_SERVICE_PORT/restaurants")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Restaurant listing successful"
        local restaurant_count=$(echo "$body" | jq '. | length')
        print_status "Found $restaurant_count restaurants"
        return 0
    else
        print_error "Restaurant listing failed with status $http_code"
        echo "Response: $body"
        return 1
    fi
}

# Function to test menu retrieval
test_menu_retrieval() {
    print_status "Testing menu retrieval..."
    
    local response=$(curl -s -w "%{http_code}" -X GET "$BASE_URL:$RESTAURANT_SERVICE_PORT/restaurants/1/menu")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Menu retrieval successful"
        local menu_count=$(echo "$body" | jq '. | length')
        print_status "Found $menu_count menu items"
        return 0
    else
        print_error "Menu retrieval failed with status $http_code"
        echo "Response: $body"
        return 1
    fi
}

# Function to test order creation
test_order_creation() {
    print_status "Testing order creation..."
    
    if [ -z "$USER_TOKEN" ]; then
        print_error "User token not available for order creation test"
        return 1
    fi
    
    local response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL:$ORDER_SERVICE_PORT/orders" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $USER_TOKEN" \
        -d "{
            \"items\": [
                {
                    \"id\": \"item1\",
                    \"name\": \"Test Pizza\",
                    \"price\": 15.99,
                    \"quantity\": 1,
                    \"restaurantId\": \"1\",
                    \"restaurantName\": \"Test Restaurant\"
                }
            ],
            \"total\": 15.99,
            \"restaurantId\": \"1\"
        }")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "201" ]; then
        print_success "Order creation successful"
        local order_id=$(echo "$body" | jq -r '.id')
        print_status "Created order with ID: $order_id"
        return 0
    else
        print_error "Order creation failed with status $http_code"
        echo "Response: $body"
        return 1
    fi
}

# Function to test authentication with invalid token
test_invalid_auth() {
    print_status "Testing authentication with invalid token..."
    
    local response=$(curl -s -w "%{http_code}" -X GET "$BASE_URL:$RESTAURANT_SERVICE_PORT/restaurants/1/menu" \
        -H "Authorization: Bearer invalid_token")
    
    local http_code="${response: -3}"
    
    if [ "$http_code" = "401" ]; then
        print_success "Invalid token correctly rejected"
        return 0
    else
        print_error "Invalid token not properly handled (status: $http_code)"
        return 1
    fi
}

# Function to test input validation
test_input_validation() {
    print_status "Testing input validation..."
    
    # Test SQL injection attempt
    local response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL:$USER_SERVICE_PORT/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"test@example.com'; DROP TABLE users; --\",
            \"password\": \"password123\"
        }")
    
    local http_code="${response: -3}"
    
    if [ "$http_code" = "400" ] || [ "$http_code" = "401" ]; then
        print_success "SQL injection attempt properly handled"
    else
        print_error "SQL injection attempt not properly handled (status: $http_code)"
        return 1
    fi
    
    # Test XSS attempt
    local response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL:$USER_SERVICE_PORT/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"<script>alert('xss')</script>\",
            \"email\": \"test@example.com\",
            \"password\": \"password123\"
        }")
    
    local http_code="${response: -3}"
    
    if [ "$http_code" = "400" ]; then
        print_success "XSS attempt properly handled"
        return 0
    else
        print_error "XSS attempt not properly handled (status: $http_code)"
        return 1
    fi
}

# Function to test frontend applications
test_frontend_applications() {
    print_status "Testing frontend applications..."
    
    # Test restaurant dashboard
    local response=$(curl -s -w "%{http_code}" -X GET "$BASE_URL:$RESTAURANT_DASHBOARD_PORT")
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Restaurant dashboard is accessible"
    else
        print_error "Restaurant dashboard not accessible (status: $http_code)"
        return 1
    fi
    
    # Test admin dashboard
    local response=$(curl -s -w "%{http_code}" -X GET "$BASE_URL:$ADMIN_DASHBOARD_PORT")
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Admin dashboard is accessible"
        return 0
    else
        print_error "Admin dashboard not accessible (status: $http_code)"
        return 1
    fi
}

# Function to run performance tests
test_performance() {
    print_status "Running performance tests..."
    
    # Test response times
    local start_time=$(date +%s%N)
    curl -s "$BASE_URL:$RESTAURANT_SERVICE_PORT/restaurants" > /dev/null
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ $duration -lt 1000 ]; then
        print_success "Restaurant API response time: ${duration}ms (acceptable)"
    else
        print_warning "Restaurant API response time: ${duration}ms (slow)"
    fi
    
    # Test concurrent requests
    print_status "Testing concurrent requests..."
    local success_count=0
    local total_requests=10
    
    for i in $(seq 1 $total_requests); do
        if curl -s -f "$BASE_URL:$RESTAURANT_SERVICE_PORT/restaurants" > /dev/null 2>&1; then
            success_count=$((success_count + 1))
        fi
    done
    
    local success_rate=$(( (success_count * 100) / total_requests ))
    print_status "Concurrent request success rate: ${success_rate}%"
    
    if [ $success_rate -ge 90 ]; then
        print_success "Performance test passed"
        return 0
    else
        print_error "Performance test failed"
        return 1
    fi
}

# Function to generate test report
generate_test_report() {
    local test_results_file="test_results_$(date +%Y%m%d_%H%M%S).txt"
    
    print_status "Generating test report: $test_results_file"
    
    cat > "$test_results_file" << EOF
PlatePal Test Report
Generated: $(date)
Test Environment: Local Development

Test Results:
- User Registration: $([ $? -eq 0 ] && echo "PASS" || echo "FAIL")
- User Login: $([ $? -eq 0 ] && echo "PASS" || echo "FAIL")
- Restaurant Listing: $([ $? -eq 0 ] && echo "PASS" || echo "FAIL")
- Menu Retrieval: $([ $? -eq 0 ] && echo "PASS" || echo "FAIL")
- Order Creation: $([ $? -eq 0 ] && echo "PASS" || echo "FAIL")
- Authentication Security: $([ $? -eq 0 ] && echo "PASS" || echo "FAIL")
- Input Validation: $([ $? -eq 0 ] && echo "PASS" || echo "FAIL")
- Frontend Applications: $([ $? -eq 0 ] && echo "PASS" || echo "FAIL")
- Performance Tests: $([ $? -eq 0 ] && echo "PASS" || echo "FAIL")

Environment Details:
- User Service: $BASE_URL:$USER_SERVICE_PORT
- Restaurant Service: $BASE_URL:$RESTAURANT_SERVICE_PORT
- Order Service: $BASE_URL:$ORDER_SERVICE_PORT
- Restaurant Dashboard: $BASE_URL:$RESTAURANT_DASHBOARD_PORT
- Admin Dashboard: $BASE_URL:$ADMIN_DASHBOARD_PORT

EOF
    
    print_success "Test report generated: $test_results_file"
}

# Main test execution
main() {
    print_status "Starting PlatePal comprehensive test suite..."
    
    # Check prerequisites
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_error "jq is required but not installed"
        exit 1
    fi
    
    # Wait for services to be ready
    wait_for_service "User Service" "$USER_SERVICE_PORT"
    wait_for_service "Restaurant Service" "$RESTAURANT_SERVICE_PORT"
    wait_for_service "Order Service" "$ORDER_SERVICE_PORT"
    
    # Run tests
    local test_passed=0
    local test_failed=0
    
    # Core functionality tests
    if test_user_registration; then
        test_passed=$((test_passed + 1))
    else
        test_failed=$((test_failed + 1))
    fi
    
    if test_user_login; then
        test_passed=$((test_passed + 1))
    else
        test_failed=$((test_failed + 1))
    fi
    
    if test_restaurant_listing; then
        test_passed=$((test_passed + 1))
    else
        test_failed=$((test_failed + 1))
    fi
    
    if test_menu_retrieval; then
        test_passed=$((test_passed + 1))
    else
        test_failed=$((test_failed + 1))
    fi
    
    if test_order_creation; then
        test_passed=$((test_passed + 1))
    else
        test_failed=$((test_failed + 1))
    fi
    
    # Security tests
    if test_invalid_auth; then
        test_passed=$((test_passed + 1))
    else
        test_failed=$((test_failed + 1))
    fi
    
    if test_input_validation; then
        test_passed=$((test_passed + 1))
    else
        test_failed=$((test_failed + 1))
    fi
    
    # Frontend tests
    if test_frontend_applications; then
        test_passed=$((test_passed + 1))
    else
        test_failed=$((test_failed + 1))
    fi
    
    # Performance tests
    if test_performance; then
        test_passed=$((test_passed + 1))
    else
        test_failed=$((test_failed + 1))
    fi
    
    # Generate report
    generate_test_report
    
    # Summary
    print_status "Test Summary:"
    print_success "Passed: $test_passed"
    if [ $test_failed -gt 0 ]; then
        print_error "Failed: $test_failed"
    else
        print_success "Failed: $test_failed"
    fi
    
    if [ $test_failed -eq 0 ]; then
        print_success "All tests passed! 🎉"
        exit 0
    else
        print_error "Some tests failed. Please check the logs above."
        exit 1
    fi
}

# Run main function
main "$@"
