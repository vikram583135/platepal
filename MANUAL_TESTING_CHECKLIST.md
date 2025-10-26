# PlatePal Manual Testing Checklist

## 🧪 Comprehensive Manual Testing Checklist

This checklist provides step-by-step manual testing procedures for all features across the PlatePal platform.

## 📋 Pre-Testing Setup

### Environment Setup
- [ ] All services are running (`docker-compose up -d`)
- [ ] Database connections are established
- [ ] Test data has been seeded (`./seed-test-data.sh`)
- [ ] All applications are accessible
- [ ] WebSocket connections are working

### Test Credentials
- [ ] Customer: `john@example.com` / `password123`
- [ ] Restaurant Owner: `tony@pizzapalace.com` / `password123`
- [ ] Delivery Partner: `driver1@delivery.com` / `password123`
- [ ] Admin: `admin@platepal.com` / `password123`

## 🔧 Backend Services Testing

### User Service (Port 3001)

#### Authentication Testing
- [ ] **User Registration**
  - [ ] Navigate to registration endpoint
  - [ ] Enter valid user details (name, email, password)
  - [ ] Verify successful registration (201 status)
  - [ ] Verify JWT token is returned
  - [ ] Verify user data is stored in database

- [ ] **User Login**
  - [ ] Navigate to login endpoint
  - [ ] Enter valid credentials
  - [ ] Verify successful login (200 status)
  - [ ] Verify JWT token is returned
  - [ ] Verify token contains user information

- [ ] **Invalid Credentials**
  - [ ] Test login with invalid email
  - [ ] Test login with invalid password
  - [ ] Verify 401 Unauthorized response
  - [ ] Verify appropriate error message

- [ ] **Duplicate Registration**
  - [ ] Attempt to register with existing email
  - [ ] Verify 409 Conflict response
  - [ ] Verify appropriate error message

- [ ] **Input Validation**
  - [ ] Test registration with invalid email format
  - [ ] Test registration with short password
  - [ ] Test registration with empty fields
  - [ ] Verify 400 Bad Request responses

#### Security Testing
- [ ] **JWT Token Validation**
  - [ ] Test API calls with valid token
  - [ ] Test API calls with invalid token
  - [ ] Test API calls with expired token
  - [ ] Test API calls without token
  - [ ] Verify proper 401 responses for invalid/expired tokens

- [ ] **SQL Injection Prevention**
  - [ ] Test login with SQL injection payload
  - [ ] Test registration with SQL injection payload
  - [ ] Verify requests are properly sanitized

- [ ] **XSS Prevention**
  - [ ] Test registration with XSS payload
  - [ ] Verify input is properly escaped

### Restaurant Service (Port 3002)

#### Public Endpoints Testing
- [ ] **Restaurant Listing**
  - [ ] GET `/restaurants`
  - [ ] Verify 200 OK response
  - [ ] Verify restaurant data structure
  - [ ] Verify all required fields are present
  - [ ] Verify image URLs are accessible

- [ ] **Menu Retrieval**
  - [ ] GET `/restaurants/:id/menu`
  - [ ] Test with valid restaurant ID
  - [ ] Test with invalid restaurant ID
  - [ ] Verify menu data structure
  - [ ] Verify menu items are properly formatted

#### Protected Endpoints Testing
- [ ] **Menu Update**
  - [ ] PUT `/restaurants/:id/menu`
  - [ ] Test with valid JWT token
  - [ ] Test with invalid JWT token
  - [ ] Test with restaurant owner token
  - [ ] Test with customer token (should fail)
  - [ ] Verify menu updates are saved

- [ ] **Menu Item Management**
  - [ ] Add new menu item
  - [ ] Update existing menu item
  - [ ] Delete menu item
  - [ ] Verify changes persist

### Order Service (Port 3003)

#### Order Management Testing
- [ ] **Order Creation**
  - [ ] POST `/orders`
  - [ ] Test with valid order data
  - [ ] Test with invalid order data
  - [ ] Test with missing required fields
  - [ ] Verify order is created in database
  - [ ] Verify order ID is returned

- [ ] **Order Retrieval**
  - [ ] GET `/orders`
  - [ ] Test with valid JWT token
  - [ ] Test with invalid JWT token
  - [ ] Verify orders are returned for authenticated user
  - [ ] Verify order data structure

#### WebSocket Testing
- [ ] **Real-time Order Updates**
  - [ ] Connect to WebSocket endpoint
  - [ ] Create a new order
  - [ ] Verify `new_order` event is emitted
  - [ ] Update order status
  - [ ] Verify `order_status_update` event is emitted
  - [ ] Test multiple clients receiving updates

- [ ] **Connection Management**
  - [ ] Test WebSocket connection establishment
  - [ ] Test connection reconnection
  - [ ] Test connection cleanup on disconnect

## 🌐 Web Application Testing

### Restaurant Dashboard (Port 3004)

#### Authentication Testing
- [ ] **Login Page**
  - [ ] Navigate to `http://localhost:3004`
  - [ ] Verify login form is displayed
  - [ ] Enter valid restaurant owner credentials
  - [ ] Click "Sign In"
  - [ ] Verify redirect to dashboard
  - [ ] Verify JWT token is stored in localStorage

- [ ] **Invalid Login**
  - [ ] Enter invalid credentials
  - [ ] Verify error message is displayed
  - [ ] Verify user remains on login page

- [ ] **Protected Routes**
  - [ ] Try accessing dashboard without authentication
  - [ ] Verify redirect to login page
  - [ ] Test token expiration handling

#### Dashboard Features Testing
- [ ] **Navigation**
  - [ ] Verify sidebar navigation works
  - [ ] Test navigation between different sections
  - [ ] Verify active page highlighting

- [ ] **Menu Management**
  - [ ] Navigate to menu management page
  - [ ] Add new menu item
    - [ ] Enter item name, description, price
    - [ ] Select category
    - [ ] Upload/enter image URL
    - [ ] Click "Add Item"
    - [ ] Verify item appears in menu list
  - [ ] Edit existing menu item
    - [ ] Click edit button on menu item
    - [ ] Modify item details
    - [ ] Click "Save Changes"
    - [ ] Verify changes are reflected
  - [ ] Delete menu item
    - [ ] Click delete button on menu item
    - [ ] Confirm deletion
    - [ ] Verify item is removed from list

- [ ] **Order Management**
  - [ ] Navigate to order management page
  - [ ] Verify incoming orders are displayed
  - [ ] Test order status updates
    - [ ] Click "Accept Order"
    - [ ] Click "Mark as Preparing"
    - [ ] Click "Mark as Ready"
    - [ ] Verify status changes are reflected
  - [ ] Test order filtering
    - [ ] Filter by status (pending, confirmed, etc.)
    - [ ] Verify filter works correctly

- [ ] **Analytics Dashboard**
  - [ ] Navigate to analytics page
  - [ ] Verify sales statistics are displayed
  - [ ] Verify charts and graphs are rendered
  - [ ] Test date range filtering

#### Responsive Design Testing
- [ ] **Desktop View**
  - [ ] Test on desktop browser (1920x1080)
  - [ ] Verify all elements are properly displayed
  - [ ] Test hover effects and interactions

- [ ] **Tablet View**
  - [ ] Test on tablet viewport (768x1024)
  - [ ] Verify responsive layout works
  - [ ] Test touch interactions

- [ ] **Mobile View**
  - [ ] Test on mobile viewport (375x667)
  - [ ] Verify mobile navigation works
  - [ ] Test touch interactions

### Admin Dashboard (Port 3005)

#### Authentication Testing
- [ ] **Admin Login**
  - [ ] Navigate to `http://localhost:3005`
  - [ ] Enter admin credentials
  - [ ] Verify successful login
  - [ ] Verify redirect to admin dashboard

- [ ] **Access Control**
  - [ ] Test with customer credentials (should fail)
  - [ ] Test with restaurant owner credentials (should fail)
  - [ ] Test with delivery partner credentials (should fail)

#### Dashboard Features Testing
- [ ] **System Overview**
  - [ ] Verify key metrics are displayed
  - [ ] Verify statistics are accurate
  - [ ] Test data refresh functionality

- [ ] **User Management**
  - [ ] Navigate to user management section
  - [ ] View customer list
  - [ ] View restaurant owner list
  - [ ] View delivery partner list
  - [ ] Test user status updates
  - [ ] Test user search and filtering

- [ ] **Order Monitoring**
  - [ ] Navigate to order monitoring section
  - [ ] Verify all orders are displayed
  - [ ] Test order filtering by status
  - [ ] Test order filtering by date
  - [ ] Verify real-time order updates

- [ ] **Restaurant Management**
  - [ ] Navigate to restaurant management section
  - [ ] View restaurant list
  - [ ] Test restaurant status updates
  - [ ] Test restaurant search and filtering

- [ ] **Analytics and Reports**
  - [ ] Navigate to analytics section
  - [ ] Verify revenue charts are displayed
  - [ ] Test date range selection
  - [ ] Verify top restaurants data
  - [ ] Test export functionality (if available)

## 📱 Mobile Application Testing

### Customer Mobile App

#### Setup and Installation
- [ ] **Android Testing**
  - [ ] Install app on Android device/emulator
  - [ ] Verify app launches successfully
  - [ ] Test app permissions (location, storage)

- [ ] **iOS Testing**
  - [ ] Install app on iOS device/simulator
  - [ ] Verify app launches successfully
  - [ ] Test app permissions

#### Authentication Testing
- [ ] **Registration Flow**
  - [ ] Tap "Sign Up" button
  - [ ] Enter user details (name, email, password)
  - [ ] Tap "Create Account"
  - [ ] Verify successful registration
  - [ ] Verify redirect to home screen
  - [ ] Verify token is stored securely

- [ ] **Login Flow**
  - [ ] Enter valid credentials
  - [ ] Tap "Sign In"
  - [ ] Verify successful login
  - [ ] Verify redirect to home screen

- [ ] **Invalid Credentials**
  - [ ] Enter invalid credentials
  - [ ] Verify error message is displayed
  - [ ] Verify user remains on login screen

#### Core Features Testing
- [ ] **Restaurant Discovery**
  - [ ] Verify restaurant list loads
  - [ ] Test restaurant search functionality
  - [ ] Tap on restaurant card
  - [ ] Verify restaurant details screen opens
  - [ ] Test back navigation

- [ ] **Menu Browsing**
  - [ ] Navigate to restaurant menu
  - [ ] Verify menu items are displayed
  - [ ] Test menu search functionality
  - [ ] Test category filtering
  - [ ] Tap on menu item
  - [ ] Verify item details are shown

- [ ] **Cart Management**
  - [ ] Add item to cart
  - [ ] Verify item appears in cart
  - [ ] Modify item quantity
  - [ ] Remove item from cart
  - [ ] Verify cart total updates
  - [ ] Test cart persistence across app sessions

- [ ] **Order Placement**
  - [ ] Navigate to cart screen
  - [ ] Verify order summary is correct
  - [ ] Tap "Place Order"
  - [ ] Verify order confirmation screen
  - [ ] Verify order ID is displayed

- [ ] **Order Tracking**
  - [ ] Navigate to order tracking screen
  - [ ] Verify order status is displayed
  - [ ] Test real-time status updates
  - [ ] Verify order details are correct
  - [ ] Test navigation to restaurant

#### Real-time Features Testing
- [ ] **WebSocket Connection**
  - [ ] Place an order
  - [ ] Verify WebSocket connection is established
  - [ ] Test order status updates
  - [ ] Verify updates appear in real-time

- [ ] **Connection Recovery**
  - [ ] Disconnect from network
  - [ ] Reconnect to network
  - [ ] Verify WebSocket reconnects
  - [ ] Verify missed updates are received

#### UI/UX Testing
- [ ] **Navigation**
  - [ ] Test bottom tab navigation
  - [ ] Test stack navigation
  - [ ] Test back button functionality
  - [ ] Test deep linking

- [ ] **Responsive Design**
  - [ ] Test on different screen sizes
  - [ ] Test landscape orientation
  - [ ] Verify text is readable
  - [ ] Verify buttons are tappable

- [ ] **Accessibility**
  - [ ] Test with screen reader
  - [ ] Test with high contrast mode
  - [ ] Test with large text
  - [ ] Verify touch targets are adequate

### Delivery Partner App

#### Setup and Installation
- [ ] **Android Testing**
  - [ ] Install app on Android device/emulator
  - [ ] Verify app launches successfully
  - [ ] Test location permissions

- [ ] **iOS Testing**
  - [ ] Install app on iOS device/simulator
  - [ ] Verify app launches successfully
  - [ ] Test location permissions

#### Authentication Testing
- [ ] **Partner Login**
  - [ ] Enter delivery partner credentials
  - [ ] Verify successful login
  - [ ] Verify redirect to dashboard

- [ ] **Access Control**
  - [ ] Test with customer credentials (should fail)
  - [ ] Test with restaurant owner credentials (should fail)

#### Task Management Testing
- [ ] **Task Dashboard**
  - [ ] Verify available tasks are displayed
  - [ ] Test task refresh functionality
  - [ ] Tap on task card
  - [ ] Verify task details screen opens

- [ ] **Task Acceptance**
  - [ ] Tap "Accept Task" button
  - [ ] Verify confirmation dialog
  - [ ] Confirm task acceptance
  - [ ] Verify task moves to current tasks
  - [ ] Verify task disappears from available list

- [ ] **Task Status Updates**
  - [ ] Navigate to task details screen
  - [ ] Tap "Mark as Picked Up"
  - [ ] Verify status update
  - [ ] Tap "Mark as Delivered"
  - [ ] Verify task completion

- [ ] **Navigation Features**
  - [ ] Tap "Open Navigation" button
  - [ ] Verify navigation screen opens
  - [ ] Test step-by-step navigation
  - [ ] Test "I've Arrived" functionality
  - [ ] Test location switching

#### Real-time Features Testing
- [ ] **Task Notifications**
  - [ ] Verify new task notifications
  - [ ] Test task status updates
  - [ ] Verify WebSocket connection stability

- [ ] **Location Tracking**
  - [ ] Enable location services
  - [ ] Verify location updates
  - [ ] Test location accuracy

## 🔒 Security Testing

### Authentication Security
- [ ] **Token Security**
  - [ ] Verify JWT tokens are properly signed
  - [ ] Test token expiration handling
  - [ ] Test token refresh mechanism
  - [ ] Verify tokens are stored securely

- [ ] **Password Security**
  - [ ] Test password hashing
  - [ ] Test password strength requirements
  - [ ] Test password reset functionality

### Authorization Testing
- [ ] **Role-based Access Control**
  - [ ] Test customer access to customer features only
  - [ ] Test restaurant owner access to restaurant features only
  - [ ] Test delivery partner access to delivery features only
  - [ ] Test admin access to all features

- [ ] **API Authorization**
  - [ ] Test protected endpoints with valid tokens
  - [ ] Test protected endpoints with invalid tokens
  - [ ] Test protected endpoints without tokens
  - [ ] Test cross-role access attempts

### Data Protection Testing
- [ ] **Input Validation**
  - [ ] Test SQL injection prevention
  - [ ] Test XSS prevention
  - [ ] Test CSRF protection
  - [ ] Test input sanitization

- [ ] **Data Encryption**
  - [ ] Verify sensitive data is encrypted
  - [ ] Test HTTPS enforcement
  - [ ] Test data transmission security

## ⚡ Performance Testing

### Load Testing
- [ ] **API Performance**
  - [ ] Test response times under normal load
  - [ ] Test response times under high load
  - [ ] Test concurrent user handling
  - [ ] Test database connection limits

- [ ] **Frontend Performance**
  - [ ] Test page load times
  - [ ] Test image loading performance
  - [ ] Test JavaScript bundle size
  - [ ] Test CSS optimization

### Mobile Performance
- [ ] **App Performance**
  - [ ] Test app startup time
  - [ ] Test screen transition performance
  - [ ] Test memory usage
  - [ ] Test battery consumption

- [ ] **Network Performance**
  - [ ] Test offline functionality
  - [ ] Test slow network handling
  - [ ] Test data usage optimization

## 🧪 Integration Testing

### Cross-Platform Testing
- [ ] **Web to Mobile Integration**
  - [ ] Test user account across platforms
  - [ ] Test order data consistency
  - [ ] Test real-time updates across platforms

- [ ] **Service Integration**
  - [ ] Test user service integration
  - [ ] Test restaurant service integration
  - [ ] Test order service integration
  - [ ] Test database consistency

### End-to-End Testing
- [ ] **Complete Order Flow**
  - [ ] Customer places order via mobile app
  - [ ] Restaurant receives order via web dashboard
  - [ ] Restaurant updates order status
  - [ ] Customer receives real-time update
  - [ ] Delivery partner receives task
  - [ ] Delivery partner completes delivery
  - [ ] Customer receives delivery confirmation

- [ ] **Multi-User Scenarios**
  - [ ] Multiple customers placing orders
  - [ ] Multiple restaurants receiving orders
  - [ ] Multiple delivery partners accepting tasks
  - [ ] Real-time updates for all users

## 📊 Test Results Documentation

### Test Execution Log
- [ ] **Test Date**: ___________
- [ ] **Tester Name**: ___________
- [ ] **Environment**: ___________
- [ ] **Test Duration**: ___________

### Test Results Summary
- [ ] **Total Tests**: ___________
- [ ] **Passed**: ___________
- [ ] **Failed**: ___________
- [ ] **Skipped**: ___________
- [ ] **Pass Rate**: ___________

### Issues Found
- [ ] **Critical Issues**: ___________
- [ ] **Major Issues**: ___________
- [ ] **Minor Issues**: ___________
- [ ] **Enhancement Suggestions**: ___________

### Recommendations
- [ ] **Performance Improvements**: ___________
- [ ] **Security Enhancements**: ___________
- [ ] **UX Improvements**: ___________
- [ ] **Feature Additions**: ___________

---

## 📝 Testing Notes

### Test Environment
- **OS**: Windows/macOS/Linux
- **Browser**: Chrome/Firefox/Safari
- **Mobile OS**: Android/iOS
- **Database**: PostgreSQL + MongoDB
- **Services**: Docker containers

### Test Data
- **Users**: 9 test users (customers, restaurant owners, delivery partners, admin)
- **Restaurants**: 3 test restaurants with complete menus
- **Orders**: 3 test orders with different statuses
- **Menu Items**: 15+ test menu items across different categories

### Test Tools
- **API Testing**: curl, Postman
- **Web Testing**: Browser developer tools
- **Mobile Testing**: Device/simulator
- **Performance Testing**: Browser dev tools, Artillery
- **Security Testing**: OWASP ZAP, manual testing

This comprehensive testing checklist ensures all features and functionalities of the PlatePal platform are thoroughly tested and validated.
