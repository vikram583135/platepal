# PlatePal - Comprehensive Testing Guide

## Overview

This guide covers testing procedures for all PlatePal interfaces, including manual testing, automated testing, WebSocket testing, and integration testing.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Testing Environment Setup](#testing-environment-setup)
3. [Testing by Interface](#testing-by-interface)
4. [WebSocket Testing](#websocket-testing)
5. [Integration Testing](#integration-testing)
6. [Performance Testing](#performance-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [Security Testing](#security-testing)
9. [Docker Testing](#docker-testing)
10. [Test Scripts](#test-scripts)

---

## Prerequisites

### Required Services

Ensure all services are running:

```bash
# Using Docker Compose
docker-compose up -d

# Or locally
# User Service: http://localhost:3001
# Restaurant Service: http://localhost:3002
# Order Service: http://localhost:3003
# Restaurant Dashboard: http://localhost:3004
# Admin Dashboard: http://localhost:3005
# Customer Web: http://localhost:3006
# Delivery Web: http://localhost:3007
```

### Required Credentials

#### Customer Accounts
- Create test customers via registration or API

#### Restaurant Accounts
- See `restaurant-dashboard/RESTAURANT_CREDENTIALS.md` for 12 seeded restaurants
- Example: `italian@platepal.com` / `italian123`

#### Delivery Partner Accounts
- Create via Admin Dashboard or API

#### Admin Accounts
- Create via user service API or database

---

## Testing Environment Setup

### 1. Docker Environment

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down
```

### 2. Local Development Environment

```bash
# Backend Services
cd backend/user-service && npm run start:dev
cd backend/restaurant-service && npm run start:dev
cd backend/order-service && npm run start:dev

# Frontend Services
cd customer-web && npm run dev
cd restaurant-dashboard && npm run dev
cd delivery-web && npm run dev
cd admin-dashboard && npm run dev
```

### 3. Database Setup

```bash
# PostgreSQL (User, Restaurant, Order services)
# Port: 5433 (external) or 5432 (internal Docker)

# MongoDB (Restaurant menus)
# Port: 27017
```

---

## Testing by Interface

### 🍽️ Customer Web App (`http://localhost:3006`)

#### Authentication
- [ ] User registration
- [ ] User login
- [ ] Password validation (weak/medium/strong)
- [ ] Email validation
- [ ] Phone number validation (Indian format)
- [ ] Session persistence
- [ ] Logout functionality

#### Restaurant Browsing
- [ ] Restaurant list display
- [ ] Restaurant search with autocomplete
- [ ] Restaurant filtering:
  - [ ] Cuisine type
  - [ ] Rating
  - [ ] Delivery time
  - [ ] Price range
  - [ ] Dietary restrictions
- [ ] Restaurant sorting:
  - [ ] Popularity
  - [ ] Rating
  - [ ] Delivery time
  - [ ] Name
- [ ] Restaurant favorites (heart icon)
- [ ] Restaurant details page
- [ ] Recommendations carousel
- [ ] Pull-to-refresh functionality

#### Menu & Cart
- [ ] Menu item display
- [ ] Add to cart
- [ ] Remove from cart
- [ ] Update quantity
- [ ] Cart persistence
- [ ] Price calculation (subtotal, tax, delivery fee)
- [ ] Promo code application
- [ ] Promo code removal
- [ ] Discount calculation

#### Order Placement
- [ ] Place order
- [ ] Order confirmation
- [ ] Order ID generation
- [ ] Multiple address support
- [ ] Address selection
- [ ] Payment flow (mock)

#### Order Tracking
- [ ] Real-time order status updates
- [ ] Order tracking page
- [ ] Order history list
- [ ] Re-order functionality
- [ ] Order status badges:
  - [ ] Pending
  - [ ] Confirmed
  - [ ] Preparing
  - [ ] Ready
  - [ ] Out for delivery
  - [ ] Delivered
  - [ ] Cancelled

#### User Profile
- [ ] Profile view
- [ ] Profile edit
- [ ] Address management:
  - [ ] Add address
  - [ ] Edit address
  - [ ] Delete address
  - [ ] Set default address
- [ ] Order history
- [ ] Rewards/points display

#### Real-time Features
- [ ] WebSocket connection indicator (Live/Offline badge)
- [ ] Real-time order status updates
- [ ] Toast notifications for order events
- [ ] Automatic UI refresh on status changes

#### UI/UX Features
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states
- [ ] Error boundaries
- [ ] Empty states
- [ ] Accessibility:
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Skip to content link
  - [ ] Focus indicators

---

### 🏪 Restaurant Dashboard (`http://localhost:3004`)

#### Authentication
- [ ] Restaurant login
- [ ] Session persistence
- [ ] Logout functionality

#### Dashboard Overview
- [ ] Statistics cards:
  - [ ] Total Revenue (with trend)
  - [ ] Total Orders (with comparison)
  - [ ] Customers count
  - [ ] Average Order Value
- [ ] Revenue trend chart
- [ ] Order volume chart
- [ ] Peak hours analysis
- [ ] Top selling items widget
- [ ] Auto-refresh (60-second interval)

#### Order Management
- [ ] Order list display
- [ ] Real-time order notifications
- [ ] WebSocket connection indicator
- [ ] New order notification banner
- [ ] Order filtering:
  - [ ] Status (All, Pending, In Progress, Completed, Cancelled)
  - [ ] Customer name search
  - [ ] Order ID search
  - [ ] Date range
  - [ ] Amount range (min/max in ₹)
- [ ] Bulk actions:
  - [ ] Select all
  - [ ] Bulk accept orders
  - [ ] Bulk export
- [ ] Order statistics dashboard
- [ ] Order details view
- [ ] Order status updates:
  - [ ] Accept order
  - [ ] Mark as preparing
  - [ ] Mark as ready
  - [ ] Complete order
  - [ ] Cancel order

#### Menu Management
- [ ] Menu item list (DataTable)
- [ ] Add menu item:
  - [ ] Name, description, price
  - [ ] Category selection
  - [ ] Vegetarian/non-vegetarian
  - [ ] Availability toggle
  - [ ] Image upload
- [ ] Edit menu item
- [ ] Delete menu item
- [ ] Category management
- [ ] Price display in INR (₹)
- [ ] Search and filter
- [ ] Export to CSV

#### Staff Management
- [ ] Staff list
- [ ] Add staff member
- [ ] Edit staff member
- [ ] Delete staff member
- [ ] Staff scheduling:
  - [ ] Weekly schedule view
  - [ ] Create schedule entry
  - [ ] Edit schedule entry
  - [ ] Shift types (Morning, Afternoon, Evening, Night)
  - [ ] Break time management
  - [ ] Color-coded shifts

#### Analytics
- [ ] Analytics dashboard
- [ ] Date range filter:
  - [ ] 7 days
  - [ ] 30 days
  - [ ] 90 days
  - [ ] 1 year
  - [ ] Custom range
- [ ] Revenue analytics
- [ ] Order analytics
- [ ] Customer analytics
- [ ] CSV export functionality

#### Promotions
- [ ] Promotion list
- [ ] Create promotion:
  - [ ] Promotion type (Discount, BOGO, Free Item)
  - [ ] Discount percentage/amount
  - [ ] Minimum order value
  - [ ] Usage limits
  - [ ] Date range
  - [ ] Active/inactive toggle
- [ ] Edit promotion
- [ ] Delete promotion
- [ ] Promotion usage tracking

#### Real-time Features
- [ ] WebSocket connection status
- [ ] Real-time order notifications
- [ ] Sound notifications for new orders
- [ ] Sidebar notification badge
- [ ] Auto-refresh disabled when WebSocket connected

---

### 🚚 Delivery Web App (`http://localhost:3007`)

#### Authentication
- [ ] Delivery partner login
- [ ] Session persistence
- [ ] Logout functionality

#### Dashboard
- [ ] Available tasks list
- [ ] Active delivery display
- [ ] Availability toggle:
  - [ ] Toggle Available/Offline
  - [ ] State persistence
  - [ ] Visual feedback (green/gray)
- [ ] Quick earnings summary:
  - [ ] Today's earnings
  - [ ] Delivery count
  - [ ] Link to full earnings
- [ ] Connection status indicator

#### Task Management
- [ ] Task card display
- [ ] Accept task
- [ ] View task details:
  - [ ] Customer address
  - [ ] Restaurant location
  - [ ] Order items
  - [ ] Order total (INR)
  - [ ] Estimated distance
- [ ] Update task status:
  - [ ] Pickup (requires photo)
  - [ ] On the way
  - [ ] Delivered (requires photo + signature)

#### Delivery Features
- [ ] Photo capture:
  - [ ] Camera access
  - [ ] Capture photo
  - [ ] Retake option
  - [ ] Photo preview
  - [ ] Required for delivery completion
- [ ] Signature capture:
  - [ ] Canvas drawing
  - [ ] Touch support
  - [ ] Mouse support
  - [ ] Clear signature
  - [ ] Save signature
  - [ ] Required for delivery completion
- [ ] Route optimization display
- [ ] Earnings tracking:
  - [ ] Automatic earning addition on delivery
  - [ ] Earnings breakdown

#### Earnings Dashboard
- [ ] Full earnings page (`/earnings`)
- [ ] Total earnings display
- [ ] Today's earnings
- [ ] Weekly earnings
- [ ] Monthly earnings
- [ ] Completed deliveries count
- [ ] Average per delivery
- [ ] Earnings breakdown by date
- [ ] All amounts in INR (₹)

#### Real-time Features
- [ ] WebSocket connection status
- [ ] Real-time delivery assignments
- [ ] Real-time order updates
- [ ] Order cancellation notifications
- [ ] Automatic task list refresh

#### UI/UX Features
- [ ] Large touch targets (48px minimum, 56px for critical actions)
- [ ] High contrast design
- [ ] Outdoor visibility
- [ ] Status badges (Active, Available, Completed, Urgent)
- [ ] Responsive design

---

### 👨‍💼 Admin Dashboard (`http://localhost:3005`)

#### Authentication
- [ ] Admin login
- [ ] Session persistence
- [ ] Logout functionality

#### Dashboard Overview
- [ ] Statistics cards:
  - [ ] Total Orders
  - [ ] Total Revenue (INR)
  - [ ] Total Restaurants
  - [ ] Total Customers
  - [ ] Total Delivery Partners
- [ ] Revenue chart
- [ ] Top restaurants widget
- [ ] Recent orders display

#### Order Management
- [ ] Orders DataTable:
  - [ ] Sorting (by date, total, status)
  - [ ] Search functionality
  - [ ] Pagination
  - [ ] Export to CSV
  - [ ] Order detail modal
- [ ] Order filtering
- [ ] Order status view

#### Restaurant Management
- [ ] Restaurants DataTable:
  - [ ] Image thumbnails
  - [ ] Rating display
  - [ ] Status badges
  - [ ] Search and filter
  - [ ] Export to CSV
- [ ] Restaurant details
- [ ] Restaurant status management

#### Restaurant Approvals (RBAC)
- [ ] Approval list
- [ ] Filter by status (pending, under_review, approved, rejected)
- [ ] Document viewing:
  - [ ] License
  - [ ] Tax ID
  - [ ] Address proof
- [ ] Approval workflow:
  - [ ] Approve with notes
  - [ ] Reject with notes
  - [ ] Request more information
- [ ] Status tracking
- [ ] Permission-based access

#### Support Tickets (RBAC)
- [ ] Ticket list
- [ ] Filter by status (all, open, in_progress, resolved, closed)
- [ ] Filter by priority (urgent, high, medium, low)
- [ ] Filter by category (technical, billing, account, order, general)
- [ ] Ticket detail modal:
  - [ ] Conversation view
  - [ ] Add message/response
  - [ ] Status updates
  - [ ] Assignment to admins
- [ ] Permission-based access

#### Platform Analytics (RBAC)
- [ ] Overview cards:
  - [ ] Total users
  - [ ] Total revenue
  - [ ] Total orders
  - [ ] Average order value
- [ ] Revenue charts (daily, monthly)
- [ ] Orders analytics:
  - [ ] Orders by status
  - [ ] Orders by time of day
- [ ] User growth tracking
- [ ] Restaurant statistics
- [ ] Delivery partner statistics
- [ ] Multiple chart types (Line, Bar, Pie)
- [ ] Permission-based access

#### Customer Management
- [ ] Customers DataTable:
  - [ ] Avatar display
  - [ ] Contact information
  - [ ] Total spent (INR)
  - [ ] Order count
  - [ ] Status badges
  - [ ] Search and filter
  - [ ] Export to CSV

#### Delivery Partner Management
- [ ] Delivery Partners DataTable:
  - [ ] Avatar display
  - [ ] Vehicle information
  - [ ] Rating display
  - [ ] License number
  - [ ] Status badges
  - [ ] Search and filter
  - [ ] Export to CSV

#### Role-Based Access Control (RBAC)
- [ ] Permission checking
- [ ] Role-based navigation visibility
- [ ] Protected routes:
  - [ ] Restaurant Approvals (requires approval permission)
  - [ ] Support Tickets (requires ticket permission)
  - [ ] Analytics (requires analytics permission)

#### Real-time Features
- [ ] WebSocket connection status
- [ ] Real-time order notifications
- [ ] Real-time platform statistics updates

---

## WebSocket Testing

### Connection Testing

#### Customer Web App
1. Open browser DevTools → Network → WS
2. Navigate to Orders or Track page
3. Verify WebSocket connection to `ws://localhost:3003/socket.io/`
4. Check connection status indicator (Live badge)
5. Verify authentication token in connection

#### Restaurant Dashboard
1. Navigate to Orders page
2. Verify WebSocket connection
3. Check "Live" indicator appears
4. Verify connection status updates

#### Delivery Web App
1. Navigate to Dashboard
2. Verify WebSocket connection
3. Check connection status indicator

#### Admin Dashboard
1. Navigate to Dashboard
2. Verify WebSocket connection
3. Check connection status

### Event Testing

#### Order Created Event
1. Place order from Customer Web App
2. Verify Restaurant Dashboard receives `order_created` event
3. Verify Admin Dashboard receives `order_created` event
4. Verify Customer Web App receives confirmation
5. Check toast notifications appear

#### Order Status Update Event
1. Restaurant updates order status
2. Verify Customer Web App receives `order_status_changed` event
3. Verify Admin Dashboard receives update
4. Verify Delivery Partner receives update (if assigned)
5. Check UI updates automatically

#### Delivery Assigned Event
1. System assigns delivery partner
2. Verify Delivery Partner receives `delivery_assigned` event
3. Verify Restaurant receives update
4. Verify Customer receives update
5. Verify Admin receives update

#### Delivery Completed Event
1. Delivery Partner marks as delivered (with photo + signature)
2. Verify Customer receives `order_delivered` event
3. Verify Restaurant receives update
4. Verify Admin receives update
5. Verify earnings updated for delivery partner

#### Order Cancelled Event
1. Cancel order (any party)
2. Verify all parties receive `order_cancelled` event
3. Verify UI updates across all interfaces

### Reconnection Testing
1. Disconnect network
2. Verify reconnection attempts (exponential backoff)
3. Reconnect network
4. Verify automatic reconnection
5. Verify connection status updates

---

## Integration Testing

### End-to-End Order Flow

1. **Customer Places Order**
   - Customer browses restaurants
   - Adds items to cart
   - Applies promo code
   - Places order
   - Receives order confirmation

2. **Restaurant Receives Order**
   - Restaurant sees new order notification (WebSocket)
   - Restaurant accepts order
   - Restaurant updates status (preparing → ready)

3. **Delivery Assignment**
   - System assigns delivery partner
   - Delivery partner receives notification (WebSocket)
   - Delivery partner accepts task

4. **Delivery Process**
   - Delivery partner picks up order
   - Delivery partner captures photo
   - Delivery partner gets customer signature
   - Delivery partner marks as delivered

5. **Order Completion**
   - Customer receives delivery notification (WebSocket)
   - Restaurant receives completion update
   - Admin receives completion update
   - Earnings updated for delivery partner

### Cross-Interface Testing

- Verify real-time updates across all interfaces
- Verify currency consistency (INR)
- Verify order ID consistency
- Verify status synchronization
- Verify notification delivery

---

## Performance Testing

### Load Testing
- [ ] Test with 100+ concurrent users
- [ ] Test API response times
- [ ] Test WebSocket connection limits
- [ ] Test database query performance

### Build Performance
- [ ] Frontend build times
- [ ] Docker image build times
- [ ] Docker image sizes
- [ ] Bundle sizes

### Runtime Performance
- [ ] Page load times
- [ ] API response times
- [ ] WebSocket latency
- [ ] Database query times
- [ ] Image loading performance

---

## Accessibility Testing

### WCAG 2.1 AA Compliance

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys navigate dropdowns
- [ ] Skip to content link works

#### Screen Reader
- [ ] All images have alt text
- [ ] Form labels are announced
- [ ] Status updates are announced
- [ ] Error messages are announced
- [ ] Button states are announced

#### Visual
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators are visible
- [ ] Text is readable at 200% zoom
- [ ] Reduced motion preference respected

#### High Contrast Mode
- [ ] All elements visible in high contrast
- [ ] Text remains readable
- [ ] Interactive elements clearly visible

---

## Security Testing

### Authentication
- [ ] JWT token validation
- [ ] Token expiration handling
- [ ] Unauthorized access blocked
- [ ] Session timeout

### Authorization
- [ ] RBAC permissions enforced
- [ ] Protected routes require authentication
- [ ] Admin-only features restricted
- [ ] Restaurant data isolation

### Input Validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Input sanitization

### WebSocket Security
- [ ] WebSocket authentication
- [ ] Room-based isolation
- [ ] Token validation on connection
- [ ] Unauthorized connection rejection

---

## Docker Testing

### Container Health
```bash
# Check all services
docker-compose ps

# Check specific service
docker inspect platepal-customer-web --format='{{.State.Health.Status}}'
```

### Service Communication
- [ ] Services communicate via Docker network
- [ ] Internal URLs use service names
- [ ] External URLs use localhost
- [ ] WebSocket connections work in Docker

### Build Testing
```bash
# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build customer-web
```

### Volume Persistence
- [ ] Database data persists
- [ ] MongoDB data persists
- [ ] Logs are accessible

---

## Test Scripts

### Automated Test Suite

#### PowerShell (`test-suite.ps1`)
```powershell
.\test-suite.ps1
```

#### Bash (`test-suite.sh`)
```bash
chmod +x test-suite.sh
./test-suite.sh
```

### Manual Test Checklist

Use `MANUAL_TESTING_CHECKLIST.md` for comprehensive manual testing.

---

## Test Data

### Restaurant Credentials
See `restaurant-dashboard/RESTAURANT_CREDENTIALS.md` for 12 test restaurants.

### Test Orders
- Create test orders via Customer Web App
- Use various order totals
- Test with/without promo codes
- Test different delivery addresses

### Test Users
- Create customer accounts
- Create delivery partner accounts
- Create admin accounts with different roles

---

## Troubleshooting

### WebSocket Connection Issues
1. Check service is running
2. Check network connectivity
3. Check authentication token
4. Check CORS configuration
5. Check nginx WebSocket configuration

### Database Connection Issues
1. Check database container is running
2. Check connection credentials
3. Check network connectivity
4. Check port mappings

### Build Issues
1. Clear Docker cache: `docker builder prune -a`
2. Rebuild without cache: `docker-compose build --no-cache`
3. Check for port conflicts
4. Check for dependency issues

---

*Last Updated: Based on Phase 1-6 Implementation*
*Version: 2.0*
