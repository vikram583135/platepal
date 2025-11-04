# PlatePal - Manual Testing Checklist

## 📋 Testing Overview

This checklist covers manual testing procedures for all PlatePal interfaces. Check off each item as you test it.

**Testing Date**: _____________
**Tester Name**: _____________
**Environment**: [ ] Local [ ] Docker [ ] Production

---

## 🍽️ Customer Web App Testing

### Authentication & User Management
- [ ] User registration with valid email
- [ ] User registration with invalid email (validation error)
- [ ] User registration with weak password (validation error)
- [ ] User registration with strong password (success)
- [ ] User login with correct credentials
- [ ] User login with incorrect credentials (error)
- [ ] Session persists after page refresh
- [ ] Logout functionality
- Password strength indicator works

### Restaurant Browsing
- [ ] Restaurant list displays correctly
- [ ] Search restaurant by name (autocomplete shows suggestions)
- [ ] Clear search button works
- [ ] Filter by cuisine type
- [ ] Filter by rating (4+, 3+, etc.)
- [ ] Filter by delivery time
- [ ] Filter by price range
- [ ] Filter by dietary restrictions (vegetarian, vegan)
- [ ] Sort by popularity
- [ ] Sort by rating
- [ ] Sort by delivery time
- [ ] Sort by name
- [ ] Restaurant card displays correctly:
  - [ ] Image
  - [ ] Name
  - [ ] Rating
  - [ ] Delivery time
  - [ ] Price range
  - [ ] Favorite heart icon
- [ ] Toggle favorite restaurant (heart icon)
- [ ] Favorite persists after refresh
- [ ] Recommendations carousel displays
- [ ] Pull-to-refresh works
- [ ] Restaurant details page loads

### Cart & Checkout
- [ ] Add item to cart
- [ ] Remove item from cart
- [ ] Update item quantity
- [ ] Cart total calculates correctly
- [ ] Cart persists after refresh
- [ ] Promo code input appears
- [ ] Apply valid promo code (discount applied)
- [ ] Apply invalid promo code (error message)
- [ ] Remove applied promo code
- [ ] Subtotal, tax, delivery fee calculate correctly
- [ ] Final total includes discount
- [ ] Multiple addresses display
- [ ] Select delivery address
- [ ] Place order successfully
- [ ] Order confirmation displays
- [ ] Order ID is generated

### Order Tracking & History
- [ ] Order tracking page loads
- [ ] Real-time order status updates (no refresh needed)
- [ ] WebSocket connection indicator shows "Live"
- [ ] Toast notification appears on status change
- [ ] Order status badges display correctly:
  - [ ] Pending (yellow)
  - [ ] Confirmed (blue)
  - [ ] Preparing (blue)
  - [ ] Ready (yellow)
  - [ ] Out for delivery (blue)
  - [ ] Delivered (green)
  - [ ] Cancelled (red)
- [ ] Order history list displays
- [ ] Re-order functionality works
- [ ] Order details view works

### Profile & Settings
- [ ] Profile page loads
- [ ] Edit profile works
- [ ] Address management:
  - [ ] Add new address
  - [ ] Edit existing address
  - [ ] Delete address
  - [ ] Set default address
- [ ] Order history displays
- [ ] Rewards/points display (if applicable)

### Real-time Features
- [ ] WebSocket connects on Orders page
- [ ] WebSocket connects on Track page
- [ ] "Live" badge appears when connected
- [ ] "Offline" badge appears when disconnected
- [ ] Order status updates automatically
- [ ] Toast notifications appear for events:
  - [ ] Order created
  - [ ] Order status changed
  - [ ] Delivery assigned
  - [ ] Order delivered
  - [ ] Order cancelled

### UI/UX
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (> 1024px)
- [ ] Loading states display
- [ ] Error boundaries catch errors
- [ ] Empty states display correctly
- [ ] Accessibility:
  - [ ] Keyboard navigation works
  - [ ] Skip to content link works
  - [ ] Focus indicators visible
  - [ ] Screen reader announces changes

---

## 🏪 Restaurant Dashboard Testing

### Authentication
- [ ] Restaurant login works
- [ ] Use credentials from `RESTAURANT_CREDENTIALS.md`
- [ ] Session persists
- [ ] Logout works

### Dashboard Overview
- [ ] Statistics cards display:
  - [ ] Total Revenue (with trend indicator)
  - [ ] Total Orders (with comparison)
  - [ ] Customers count
  - [ ] Average Order Value (with growth %)
- [ ] Revenue trend chart displays
- [ ] Order volume chart displays
- [ ] Peak hours chart displays
- [ ] Top selling items widget displays
- [ ] Auto-refresh works (60-second interval)
- [ ] All values in INR (₹)

### Order Management
- [ ] Orders page loads
- [ ] Real-time order notification appears
- [ ] WebSocket connection indicator shows "Live"
- [ ] New order notification banner displays
- [ ] Sound notification plays for new orders
- [ ] Order list displays correctly
- [ ] Filter by status:
  - [ ] All
  - [ ] Pending
  - [ ] In Progress
  - [ ] Completed
  - [ ] Cancelled
- [ ] Search by customer name
- [ ] Search by order ID
- [ ] Filter by date range
- [ ] Filter by amount range (min/max in ₹)
- [ ] Bulk select works
- [ ] Bulk accept orders
- [ ] Export to CSV
- [ ] Order statistics dashboard displays
- [ ] Order details view works
- [ ] Update order status:
  - [ ] Accept order
  - [ ] Mark as preparing
  - [ ] Mark as ready
  - [ ] Complete order
  - [ ] Cancel order

### Menu Management
- [ ] Menu page loads (DataTable)
- [ ] Menu items display correctly
- [ ] All prices in INR (₹)
- [ ] Search menu items
- [ ] Sort by columns
- [ ] Pagination works
- [ ] Add menu item:
  - [ ] Form opens
  - [ ] Name, description, price inputs
  - [ ] Category selection
  - [ ] Vegetarian toggle
  - [ ] Availability toggle
  - [ ] Image upload
  - [ ] Save works
- [ ] Edit menu item
- [ ] Delete menu item
- [ ] Export to CSV

### Staff Management
- [ ] Staff list displays
- [ ] Add staff member works
- [ ] Edit staff member works
- [ ] Delete staff member works
- [ ] Navigate to Schedule
- [ ] Weekly schedule view displays
- [ ] Create schedule entry:
  - [ ] Select date
  - [ ] Select shift type (Morning, Afternoon, Evening, Night)
  - [ ] Assign staff
  - [ ] Set break times
  - [ ] Save works
- [ ] Edit schedule entry
- [ ] Color-coded shifts display correctly

### Analytics
- [ ] Analytics page loads
- [ ] Date range filter works:
  - [ ] 7 days
  - [ ] 30 days
  - [ ] 90 days
  - [ ] 1 year
  - [ ] Custom range picker
- [ ] Revenue analytics display
- [ ] Order analytics display
- [ ] Customer analytics display
- [ ] CSV export works

### Promotions
- [ ] Promotions page loads
- [ ] Create promotion:
  - [ ] Promotion type selection (Discount/BOGO/Free Item)
  - [ ] Discount percentage/amount
  - [ ] Minimum order value
  - [ ] Usage limits
  - [ ] Date range
  - [ ] Active/inactive toggle
  - [ ] Save works
- [ ] Edit promotion
- [ ] Delete promotion
- [ ] Promotion list displays

### Real-time Features
- [ ] WebSocket connects on Orders page
- [ ] "Live" indicator appears
- [ ] New order notification appears
- [ ] Sound notification plays
- [ ] Sidebar notification badge updates
- [ ] Auto-refresh disabled when WebSocket connected

---

## 🚚 Delivery Web App Testing

### Authentication
- [ ] Delivery partner login works
- [ ] Session persists
- [ ] Logout works

### Dashboard
- [ ] Dashboard loads
- [ ] Available tasks list displays
- [ ] Active delivery displays (if active)
- [ ] Availability toggle:
  - [ ] Toggle to Available (green)
  - [ ] Toggle to Offline (gray)
  - [ ] State persists on refresh
- [ ] Quick earnings summary displays:
  - [ ] Today's earnings (₹)
  - [ ] Delivery count
  - [ ] Link to full earnings works
- [ ] Connection status indicator displays

### Task Management
- [ ] Task cards display correctly:
  - [ ] Customer address
  - [ ] Restaurant location
  - [ ] Order total (₹)
  - [ ] Status badge
- [ ] Accept task works
- [ ] View task details works
- [ ] Task status updates:
  - [ ] Pickup (requires photo)
  - [ ] On the way
  - [ ] Delivered (requires photo + signature)

### Photo & Signature Capture
- [ ] Photo capture button works
- [ ] Camera permission request appears
- [ ] Camera preview displays
- [ ] Capture photo works
- [ ] Photo preview displays after capture
- [ ] Retake photo works
- [ ] Photo saved correctly
- [ ] Signature capture button works
- [ ] Canvas displays for drawing
- [ ] Draw signature with mouse works
- [ ] Draw signature with touch works (mobile)
- [ ] Clear signature works
- [ ] Save signature works
- [ ] Signature preview displays
- [ ] Delivery completion requires both photo + signature
- [ ] Error message if photo missing
- [ ] Error message if signature missing

### Earnings Dashboard
- [ ] Navigate to Earnings page
- [ ] Total earnings display (₹)
- [ ] Today's earnings display (₹)
- [ ] Weekly earnings display (₹)
- [ ] Monthly earnings display (₹)
- [ ] Completed deliveries count
- [ ] Average per delivery calculates correctly
- [ ] Earnings breakdown by date displays
- [ ] All amounts in INR (₹)

### Real-time Features
- [ ] WebSocket connects
- [ ] Connection status indicator displays
- [ ] Real-time delivery assignment notification
- [ ] Real-time order update notification
- [ ] Order cancellation notification
- [ ] Task list refreshes automatically

### UI/UX
- [ ] Large touch targets (48px minimum)
- [ ] Critical actions have 56px touch targets
- [ ] High contrast design
- [ ] Status badges visible:
  - [ ] Active (green)
  - [ ] Available (blue)
  - [ ] Completed (purple)
  - [ ] Urgent (pink)
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

---

## 👨‍💼 Admin Dashboard Testing

### Authentication
- [ ] Admin login works
- [ ] Session persists
- [ ] Logout works

### Dashboard Overview
- [ ] Statistics cards display:
  - [ ] Total Orders
  - [ ] Total Revenue (₹)
  - [ ] Total Restaurants
  - [ ] Total Customers
  - [ ] Total Delivery Partners
- [ ] Revenue chart displays
- [ ] Top restaurants widget displays
- [ ] Recent orders display
- [ ] All values in INR (₹)

### Orders Management
- [ ] Orders DataTable loads
- [ ] Sort by columns works:
  - [ ] Order ID
  - [ ] Customer name
  - [ ] Restaurant name
  - [ ] Total
  - [ ] Status
  - [ ] Date
- [ ] Search orders works
- [ ] Pagination works
- [ ] Export to CSV works
- [ ] Click row opens order detail modal
- [ ] Order detail modal displays:
  - [ ] Customer information
  - [ ] Restaurant information
  - [ ] Order items with prices (₹)
  - [ ] Total amount (₹)
  - [ ] Status badge
  - [ ] Delivery partner (if assigned)
  - [ ] Date/time

### Restaurant Management
- [ ] Restaurants DataTable loads
- [ ] Image thumbnails display
- [ ] Rating display works
- [ ] Status badges display:
  - [ ] Active (green)
  - [ ] Inactive (gray)
  - [ ] Suspended (red)
- [ ] Search restaurants works
- [ ] Sort by columns works
- [ ] Export to CSV works

### Restaurant Approvals (RBAC)
- [ ] Navigate to Approvals (requires permission)
- [ ] Approval list displays
- [ ] Filter by status works:
  - [ ] All
  - [ ] Pending
  - [ ] Under Review
  - [ ] Approved
  - [ ] Rejected
- [ ] View restaurant documents:
  - [ ] License
  - [ ] Tax ID
  - [ ] Address proof
- [ ] Approve restaurant with notes
- [ ] Reject restaurant with notes
- [ ] Status updates correctly
- [ ] Unauthorized access blocked (if no permission)

### Support Tickets (RBAC)
- [ ] Navigate to Tickets (requires permission)
- [ ] Ticket list displays
- [ ] Filter by status works:
  - [ ] All
  - [ ] Open
  - [ ] In Progress
  - [ ] Resolved
  - [ ] Closed
- [ ] Filter by priority works:
  - [ ] Urgent
  - [ ] High
  - [ ] Medium
  - [ ] Low
- [ ] Filter by category works:
  - [ ] Technical
  - [ ] Billing
  - [ ] Account
  - [ ] Order
  - [ ] General
- [ ] Click ticket opens detail modal
- [ ] Conversation view displays
- [ ] Add message/response works
- [ ] Update ticket status works
- [ ] Assign to admin works
- [ ] Unauthorized access blocked (if no permission)

### Platform Analytics (RBAC)
- [ ] Navigate to Analytics (requires permission)
- [ ] Overview cards display:
  - [ ] Total users
  - [ ] Total revenue (₹)
  - [ ] Total orders
  - [ ] Average order value (₹)
- [ ] Revenue charts display:
  - [ ] Daily revenue chart
  - [ ] Monthly revenue chart
- [ ] Orders analytics display:
  - [ ] Orders by status (pie chart)
  - [ ] Orders by time of day (bar chart)
- [ ] User growth tracking displays
- [ ] Restaurant statistics display
- [ ] Delivery partner statistics display
- [ ] All values in INR (₹)
- [ ] Unauthorized access blocked (if no permission)

### Customer Management
- [ ] Customers DataTable loads
- [ ] Avatar displays correctly
- [ ] Contact information displays
- [ ] Total spent in INR (₹)
- [ ] Order count displays
- [ ] Status badges display:
  - [ ] Active (green)
  - [ ] Inactive (gray)
  - [ ] Banned (red)
- [ ] Search customers works
- [ ] Sort by columns works
- [ ] Export to CSV works

### Delivery Partner Management
- [ ] Delivery Partners DataTable loads
- [ ] Avatar displays correctly
- [ ] Vehicle information displays
- [ ] Rating display works
- [ ] License number displays
- [ ] Status badges display
- [ ] Search delivery partners works
- [ ] Sort by columns works
- [ ] Export to CSV works

### RBAC Testing
- [ ] Permission checking works
- [ ] Protected routes require authentication
- [ ] Admin-only features restricted
- [ ] Different roles see different features

### Real-time Features
- [ ] WebSocket connects
- [ ] Connection status indicator displays
- [ ] Real-time order notifications
- [ ] Real-time platform statistics updates

---

## 🔄 WebSocket Testing

### Connection Testing
- [ ] Customer Web: WebSocket connects on Orders page
- [ ] Customer Web: WebSocket connects on Track page
- [ ] Restaurant Dashboard: WebSocket connects on Orders page
- [ ] Delivery Web: WebSocket connects on Dashboard
- [ ] Admin Dashboard: WebSocket connects on Dashboard
- [ ] Connection indicator shows "Live" when connected
- [ ] Connection indicator shows "Offline" when disconnected

### Event Testing
- [ ] Order created event received by all parties
- [ ] Order status changed event received by all parties
- [ ] Delivery assigned event received by all parties
- [ ] Delivery picked up event received by all parties
- [ ] Delivery delivered event received by all parties
- [ ] Order cancelled event received by all parties
- [ ] Toast notifications appear for all events
- [ ] UI updates automatically (no refresh)

### Reconnection Testing
- [ ] Disconnect network
- [ ] Reconnection attempts occur (exponential backoff)
- [ ] Reconnect network
- [ ] Automatic reconnection works
- [ ] Connection status updates correctly

---

## 🐳 Docker Testing

### Container Health
- [ ] All containers start successfully
- [ ] Health checks pass for all services
- [ ] No container restarts unexpectedly
- [ ] Logs show no errors

### Service Communication
- [ ] Services communicate via Docker network
- [ ] Internal URLs use service names
- [ ] External URLs use localhost
- [ ] WebSocket connections work in Docker
- [ ] API calls work between services

### Build Testing
- [ ] All Dockerfiles build successfully
- [ ] Multi-stage builds work
- [ ] Image sizes are optimized
- [ ] Build times are acceptable

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys navigate dropdowns
- [ ] Skip to content link works

### Screen Reader
- [ ] All images have alt text
- [ ] Form labels are announced
- [ ] Status updates are announced
- [ ] Error messages are announced
- [ ] Button states are announced

### Visual
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Focus indicators are visible
- [ ] Text is readable at 200% zoom
- [ ] Reduced motion preference respected
- [ ] High contrast mode works

---

## 🔒 Security Testing

### Authentication
- [ ] JWT token validation works
- [ ] Token expiration handled correctly
- [ ] Unauthorized access blocked
- [ ] Session timeout works

### Authorization
- [ ] RBAC permissions enforced
- [ ] Protected routes require authentication
- [ ] Admin-only features restricted
- [ ] Restaurant data isolation works

### Input Validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Input sanitization works

### WebSocket Security
- [ ] WebSocket authentication required
- [ ] Room-based isolation works
- [ ] Token validation on connection
- [ ] Unauthorized connection rejected

---

## 📊 Test Results Summary

### Overall Status
- [ ] All critical tests passed
- [ ] WebSocket real-time updates work
- [ ] All interfaces display INR correctly
- [ ] RBAC permissions enforced
- [ ] Docker builds successful
- [ ] Health checks pass

### Issues Found
1. _____________________________
2. _____________________________
3. _____________________________

### Notes
________________________________
________________________________
________________________________

---

**Test Completed By**: _____________
**Date**: _____________
**Signature**: _____________

---

*Last Updated: Phase 1-6 Complete*
*Version: 2.0*

