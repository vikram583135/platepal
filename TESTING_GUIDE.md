# PlatePal Testing Guide

## 🧪 Comprehensive Testing Guide for All Features and Functionalities

This guide provides step-by-step instructions for testing all features across the PlatePal platform, including backend services, web applications, and mobile apps.

## 📋 Testing Overview

### Test Categories
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and service integration testing
- **End-to-End Tests**: Complete user workflow testing
- **Manual Testing**: Feature validation and user experience testing
- **Performance Tests**: Load testing and performance validation
- **Security Tests**: Authentication, authorization, and data protection

### Testing Environment Setup
- **Local Development**: Docker Compose environment
- **Test Databases**: Separate test instances for PostgreSQL and MongoDB
- **Mock Data**: Seeded test data for consistent testing
- **Test Users**: Pre-configured test accounts for different roles

## 🚀 Quick Start Testing

### 1. Start Test Environment
```bash
# Start all services
docker-compose up -d

# Verify all services are running
docker-compose ps

# Check service health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### 2. Install Dependencies
```bash
# Backend services
cd backend/user-service && npm install
cd ../restaurant-service && npm install
cd ../order-service && npm install

# Frontend applications
cd ../../restaurant-dashboard && npm install
cd ../admin-dashboard && npm install

# Mobile apps
cd ../CustomerApp && npm install
cd ../delivery-app/DeliveryApp && npm install
```

## 🔧 Backend Services Testing

### User Service Testing (Port 3001)

#### Test User Registration
```bash
# Test successful registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 201 Created with JWT token
```

#### Test User Login
```bash
# Test successful login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 200 OK with JWT token
```

#### Test Invalid Credentials
```bash
# Test invalid email
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@example.com",
    "password": "password123"
  }'

# Expected: 401 Unauthorized
```

#### Test Duplicate Registration
```bash
# Test duplicate email registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 409 Conflict
```

### Restaurant Service Testing (Port 3002)

#### Test Restaurant Listing
```bash
# Get all restaurants
curl -X GET http://localhost:3002/restaurants

# Expected: 200 OK with restaurant list
```

#### Test Menu Retrieval
```bash
# Get restaurant menu (replace :id with actual restaurant ID)
curl -X GET http://localhost:3002/restaurants/1/menu

# Expected: 200 OK with menu items
```

#### Test Menu Update (Protected)
```bash
# Update menu (requires JWT token)
curl -X PUT http://localhost:3002/restaurants/1/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "name": "Test Pizza",
        "description": "Delicious test pizza",
        "price": 15.99,
        "category": "Pizza"
      }
    ]
  }'

# Expected: 200 OK with updated menu
```

### Order Service Testing (Port 3003)

#### Test Order Creation
```bash
# Create new order
curl -X POST http://localhost:3003/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "id": "item1",
        "name": "Test Pizza",
        "price": 15.99,
        "quantity": 1,
        "restaurantId": "1",
        "restaurantName": "Test Restaurant"
      }
    ],
    "total": 15.99,
    "restaurantId": "1"
  }'

# Expected: 201 Created with order details
```

#### Test WebSocket Connection
```javascript
// Test WebSocket connection for real-time updates
const io = require('socket.io-client');
const socket = io('http://localhost:3003');

socket.on('connect', () => {
  console.log('Connected to order service');
});

socket.on('new_order', (order) => {
  console.log('New order received:', order);
});

socket.on('order_status_update', (data) => {
  console.log('Order status updated:', data);
});
```

## 🌐 Web Application Testing

### Restaurant Dashboard Testing

#### 1. Access the Application
- Navigate to `http://localhost:3004`
- Verify the login page loads correctly

#### 2. Test Authentication
```bash
# Test login functionality
1. Enter valid credentials
2. Click "Sign In"
3. Verify redirect to dashboard
4. Verify JWT token is stored in localStorage
```

#### 3. Test Dashboard Features
- **Navigation**: Verify sidebar navigation works
- **Menu Management**: 
  - Add new menu item
  - Edit existing item
  - Delete item
  - Verify changes persist
- **Order Management**:
  - View incoming orders
  - Update order status
  - Verify real-time updates

#### 4. Test Protected Routes
- Try accessing dashboard without authentication
- Verify redirect to login page
- Test token expiration handling

### Admin Dashboard Testing

#### 1. Access the Application
- Navigate to `http://localhost:3005`
- Verify the admin login page loads

#### 2. Test Admin Authentication
```bash
# Test admin login
1. Enter admin credentials
2. Verify successful login
3. Verify admin dashboard loads
```

#### 3. Test Admin Features
- **Dashboard Overview**:
  - Verify statistics display correctly
  - Check data accuracy
- **User Management**:
  - View customer list
  - View restaurant partners
  - View delivery partners
- **Order Monitoring**:
  - View all orders
  - Filter by status
  - Verify real-time updates
- **Analytics**:
  - Check revenue charts
  - Verify top restaurants data

## 📱 Mobile Application Testing

### Customer Mobile App Testing

#### 1. Setup Development Environment
```bash
# For Android
cd CustomerApp
npm run android

# For iOS (macOS only)
npm run ios
```

#### 2. Test Authentication Flow
- **Registration**:
  - Enter valid user details
  - Verify successful registration
  - Check token storage
- **Login**:
  - Enter credentials
  - Verify successful login
  - Check navigation to home screen

#### 3. Test Core Features
- **Restaurant Discovery**:
  - Verify restaurant list loads
  - Test search functionality
  - Check restaurant details
- **Menu Browsing**:
  - Navigate to restaurant menu
  - Test menu item display
  - Verify search within menu
- **Cart Management**:
  - Add items to cart
  - Modify quantities
  - Remove items
  - Verify cart persistence
- **Order Placement**:
  - Proceed to checkout
  - Verify order confirmation
  - Check order tracking screen

#### 4. Test Real-time Features
- Place an order
- Verify real-time status updates
- Test WebSocket connection stability

### Delivery Partner App Testing

#### 1. Setup Development Environment
```bash
# For Android
cd delivery-app/DeliveryApp
npm run android

# For iOS (macOS only)
npm run ios
```

#### 2. Test Partner Authentication
- Login with delivery partner credentials
- Verify dashboard loads correctly

#### 3. Test Task Management
- **Task Dashboard**:
  - View available tasks
  - Accept delivery task
  - Verify task assignment
- **Task Details**:
  - View task information
  - Update task status
  - Navigate to locations
- **Real-time Updates**:
  - Verify task notifications
  - Test status synchronization

## 🔒 Security Testing

### Authentication Testing
```bash
# Test JWT token validation
curl -X GET http://localhost:3002/restaurants/1/menu \
  -H "Authorization: Bearer invalid_token"

# Expected: 401 Unauthorized

# Test expired token
curl -X GET http://localhost:3002/restaurants/1/menu \
  -H "Authorization: Bearer expired_token"

# Expected: 401 Unauthorized
```

### Authorization Testing
```bash
# Test role-based access
# Customer trying to access admin endpoints
curl -X GET http://localhost:3005/admin/users \
  -H "Authorization: Bearer customer_token"

# Expected: 403 Forbidden
```

### Input Validation Testing
```bash
# Test SQL injection prevention
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com'; DROP TABLE users; --",
    "password": "password123"
  }'

# Expected: 400 Bad Request (validation error)

# Test XSS prevention
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert('xss')</script>",
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 400 Bad Request (validation error)
```

## ⚡ Performance Testing

### Load Testing with Artillery
```bash
# Install Artillery
npm install -g artillery

# Test user service
artillery quick --count 100 --num 10 http://localhost:3001/auth/login

# Test restaurant service
artillery quick --count 100 --num 10 http://localhost:3002/restaurants
```

### Database Performance Testing
```bash
# Test database connection limits
# Monitor PostgreSQL connections
docker exec platepal-postgres psql -U platepal_user -d platepal_db -c "SELECT count(*) FROM pg_stat_activity;"

# Test MongoDB performance
docker exec platepal-mongo mongosh --eval "db.runCommand({ping: 1})"
```

## 🧪 Automated Testing

### Backend Service Tests
```bash
# Run unit tests for each service
cd backend/user-service && npm test
cd ../restaurant-service && npm test
cd ../order-service && npm test
```

### Frontend Application Tests
```bash
# Run tests for web applications
cd restaurant-dashboard && npm test
cd ../admin-dashboard && npm test
```

### Mobile App Tests
```bash
# Run React Native tests
cd CustomerApp && npm test
cd ../delivery-app/DeliveryApp && npm test
```

## 📊 Test Data Management

### Seed Test Data
```bash
# Create test users
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "customer@test.com",
    "password": "password123"
  }'

curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Restaurant Owner",
    "email": "restaurant@test.com",
    "password": "password123"
  }'

curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Delivery Partner",
    "email": "delivery@test.com",
    "password": "password123"
  }'
```

### Database Reset
```bash
# Reset test databases
docker-compose down -v
docker-compose up -d
```

## 🐛 Bug Reporting Template

### Bug Report Format
```
**Bug Title**: Brief description of the issue

**Environment**:
- OS: Windows/macOS/Linux
- Browser: Chrome/Firefox/Safari (for web apps)
- Device: Android/iOS (for mobile apps)
- Version: App version number

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happens

**Screenshots**: If applicable

**Additional Information**: Any other relevant details
```

## 📈 Test Coverage Goals

### Backend Services
- **Unit Tests**: 90%+ code coverage
- **Integration Tests**: All API endpoints covered
- **Error Handling**: All error scenarios tested

### Frontend Applications
- **Component Tests**: All major components tested
- **User Flows**: Complete user journeys tested
- **Responsive Design**: Multiple screen sizes tested

### Mobile Applications
- **Screen Tests**: All screens and navigation tested
- **Feature Tests**: All major features validated
- **Device Compatibility**: Multiple devices tested

## 🔄 Continuous Testing

### Pre-commit Hooks
```bash
# Install pre-commit hooks
npm install --save-dev husky lint-staged

# Configure package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### CI/CD Testing
- Automated tests run on every commit
- Code coverage reports generated
- Security scans performed
- Performance benchmarks tracked

## 📋 Testing Checklist

### Pre-Release Testing
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] End-to-end tests pass
- [ ] Security tests pass
- [ ] Performance tests meet requirements
- [ ] Cross-browser compatibility verified
- [ ] Mobile device compatibility verified
- [ ] Accessibility compliance verified
- [ ] Documentation updated
- [ ] Deployment tested

### Post-Release Testing
- [ ] Production environment health checks
- [ ] User acceptance testing
- [ ] Performance monitoring
- [ ] Error rate monitoring
- [ ] User feedback collection

## 🆘 Troubleshooting Common Issues

### Database Connection Issues
```bash
# Check database status
docker-compose ps

# Restart database services
docker-compose restart postgres_db mongo_db

# Check database logs
docker-compose logs postgres_db
docker-compose logs mongo_db
```

### Service Communication Issues
```bash
# Check service health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# Check service logs
docker-compose logs user-service
docker-compose logs restaurant-service
docker-compose logs order-service
```

### Mobile App Issues
```bash
# Clear React Native cache
cd CustomerApp && npx react-native start --reset-cache

# Rebuild Android app
cd android && ./gradlew clean && cd .. && npm run android

# Rebuild iOS app (macOS only)
cd ios && xcodebuild clean && cd .. && npm run ios
```

---

This comprehensive testing guide ensures all features and functionalities of the PlatePal platform are thoroughly tested and validated before production deployment.
