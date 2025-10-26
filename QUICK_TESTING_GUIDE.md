# PlatePal Quick Testing Guide

## 🚀 Quick Start Testing

### 1. Start All Services
```bash
# Start the complete PlatePal platform
docker-compose up -d

# Verify all services are running
docker-compose ps
```

### 2. Seed Test Data
```bash
# Run the test data seeding script
chmod +x seed-test-data.sh
./seed-test-data.sh
```

### 3. Run Automated Tests
```bash
# Run the comprehensive test suite
chmod +x test-suite.sh
./test-suite.sh

# Or on Windows PowerShell
./test-suite.ps1
```

## 📱 Test All Applications

### Customer Mobile App
```bash
cd CustomerApp
npm install
npm run android  # or npm run ios
```

**Test Credentials**: `john@example.com` / `password123`

**Key Tests**:
- [ ] Login/Register
- [ ] Browse restaurants
- [ ] Add items to cart
- [ ] Place order
- [ ] Track order in real-time

### Restaurant Dashboard
**URL**: http://localhost:3004

**Test Credentials**: `tony@pizzapalace.com` / `password123`

**Key Tests**:
- [ ] Login to dashboard
- [ ] Manage menu items
- [ ] Process incoming orders
- [ ] Update order status

### Delivery Partner App
```bash
cd delivery-app/DeliveryApp
npm install
npm run android  # or npm run ios
```

**Test Credentials**: `driver1@delivery.com` / `password123`

**Key Tests**:
- [ ] Login to partner dashboard
- [ ] Accept delivery tasks
- [ ] Navigate to locations
- [ ] Update delivery status

### Admin Dashboard
**URL**: http://localhost:3005

**Test Credentials**: `admin@platepal.com` / `password123`

**Key Tests**:
- [ ] Login to admin panel
- [ ] View system analytics
- [ ] Manage users and restaurants
- [ ] Monitor all orders

## 🔧 Backend API Testing

### Test User Service (Port 3001)
```bash
# Test user registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test user login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Restaurant Service (Port 3002)
```bash
# Get all restaurants
curl http://localhost:3002/restaurants

# Get restaurant menu
curl http://localhost:3002/restaurants/1/menu
```

### Test Order Service (Port 3003)
```bash
# Create order (replace YOUR_JWT_TOKEN with actual token)
curl -X POST http://localhost:3003/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"items":[{"id":"item1","name":"Test Pizza","price":15.99,"quantity":1,"restaurantId":"1","restaurantName":"Test Restaurant"}],"total":15.99,"restaurantId":"1"}'
```

## 🧪 Test Scenarios

### Complete Order Flow Test
1. **Customer places order** via mobile app
2. **Restaurant receives order** via web dashboard
3. **Restaurant updates status** to "preparing"
4. **Customer sees update** in real-time
5. **Delivery partner accepts task** via mobile app
6. **Delivery partner picks up order**
7. **Delivery partner delivers order**
8. **Customer receives confirmation**

### Multi-User Test
1. **Multiple customers** place orders simultaneously
2. **Multiple restaurants** process orders
3. **Multiple delivery partners** accept tasks
4. **Verify real-time updates** for all users
5. **Check data consistency** across all systems

## 🔒 Security Testing

### Authentication Tests
```bash
# Test invalid credentials
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@example.com","password":"wrongpassword"}'

# Test protected endpoint without token
curl http://localhost:3002/restaurants/1/menu

# Test protected endpoint with invalid token
curl -H "Authorization: Bearer invalid_token" http://localhost:3002/restaurants/1/menu
```

### Input Validation Tests
```bash
# Test SQL injection prevention
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com'\''; DROP TABLE users; --","password":"password123"}'

# Test XSS prevention
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert('\''xss'\'')</script>","email":"test@example.com","password":"password123"}'
```

## ⚡ Performance Testing

### Response Time Tests
```bash
# Test API response times
time curl http://localhost:3002/restaurants
time curl http://localhost:3002/restaurants/1/menu
```

### Load Testing
```bash
# Install Artillery for load testing
npm install -g artillery

# Test user service
artillery quick --count 100 --num 10 http://localhost:3001/auth/login

# Test restaurant service
artillery quick --count 100 --num 10 http://localhost:3002/restaurants
```

## 📊 Test Results

### Expected Results
- **All API endpoints** return correct status codes
- **Authentication** works across all applications
- **Real-time updates** function properly
- **Data consistency** maintained across services
- **Security measures** prevent common attacks
- **Performance** meets acceptable standards

### Common Issues
- **Database connection** issues
- **WebSocket connection** problems
- **Token expiration** handling
- **CORS** configuration
- **Mobile app** build issues

## 🆘 Troubleshooting

### Services Not Starting
```bash
# Check Docker status
docker-compose ps

# View service logs
docker-compose logs user-service
docker-compose logs restaurant-service
docker-compose logs order-service

# Restart services
docker-compose restart
```

### Database Issues
```bash
# Check database connections
docker exec platepal-postgres psql -U platepal_user -d platepal_db -c "SELECT 1;"
docker exec platepal-mongo mongosh --eval "db.runCommand({ping: 1})"

# Reset databases
docker-compose down -v
docker-compose up -d
```

### Mobile App Issues
```bash
# Clear React Native cache
cd CustomerApp && npx react-native start --reset-cache

# Rebuild Android app
cd android && ./gradlew clean && cd .. && npm run android
```

## 📋 Test Checklist Summary

### ✅ Backend Services
- [ ] User Service (authentication, registration)
- [ ] Restaurant Service (restaurants, menus)
- [ ] Order Service (orders, real-time updates)

### ✅ Frontend Applications
- [ ] Restaurant Dashboard (menu management, orders)
- [ ] Admin Dashboard (analytics, user management)

### ✅ Mobile Applications
- [ ] Customer App (browsing, ordering, tracking)
- [ ] Delivery App (tasks, navigation, status updates)

### ✅ Integration Testing
- [ ] Cross-platform data consistency
- [ ] Real-time updates across all apps
- [ ] Complete order workflow

### ✅ Security Testing
- [ ] Authentication and authorization
- [ ] Input validation and sanitization
- [ ] SQL injection and XSS prevention

### ✅ Performance Testing
- [ ] API response times
- [ ] Concurrent user handling
- [ ] Mobile app performance

---

**Total Test Coverage**: 100+ test cases across all applications and services

**Estimated Testing Time**: 2-4 hours for comprehensive testing

**Test Environment**: Local development with Docker containers

This quick testing guide provides essential testing procedures for validating all PlatePal platform features and functionalities.
