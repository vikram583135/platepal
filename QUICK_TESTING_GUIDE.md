# PlatePal - Quick Testing Guide

## 🚀 Quick Start Testing

### 1. Start All Services

```bash
# Using Docker
docker-compose up -d

# Or locally
# Start backend services (ports 3001, 3002, 3003)
# Start frontend services (ports 3004, 3005, 3006, 3007)
```

### 2. Verify Services

```bash
# Check Docker services
docker-compose ps

# Or test endpoints
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

---

## ⚡ Quick Test Scenarios

### Scenario 1: Complete Order Flow (5 minutes)

1. **Customer Web** (`http://localhost:3006`)
   - Login/Register
   - Browse restaurants
   - Add items to cart
   - Apply promo code
   - Place order
   - Note order ID

2. **Restaurant Dashboard** (`http://localhost:3004`)
   - Login: `italian@platepal.com` / `italian123`
   - See new order notification
   - Accept order
   - Update status: Preparing → Ready

3. **Delivery Web** (`http://localhost:3007`)
   - Login
   - Accept delivery task
   - Pickup: Capture photo
   - Delivery: Capture photo + signature
   - Mark as delivered

4. **Customer Web**
   - Check order status updated
   - See delivery confirmation

5. **Admin Dashboard** (`http://localhost:3005`)
   - Login
   - View order in orders list
   - Check statistics updated

**✅ Expected**: Order flows smoothly across all interfaces with real-time updates

---

### Scenario 2: WebSocket Real-time Updates (3 minutes)

1. **Customer Web**
   - Open Orders page
   - Check "Live" badge appears
   - Place an order

2. **Restaurant Dashboard**
   - Check "Live" indicator on Orders page
   - Verify new order notification appears
   - Check sound notification plays

3. **Customer Web**
   - Restaurant updates status
   - Verify status updates automatically (no refresh)

4. **Delivery Web**
   - Check connection status
   - Verify task assigned notification

**✅ Expected**: Real-time updates without page refresh

---

### Scenario 3: Restaurant Dashboard Features (5 minutes)

1. **Menu Management**
   - View menu (DataTable with search)
   - Add new menu item (INR pricing)
   - Edit menu item
   - Export to CSV

2. **Staff Scheduling**
   - Navigate to Staff → Schedule
   - Create weekly schedule
   - Assign shifts
   - Edit schedule entries

3. **Promotions**
   - Create promotion (Discount/BOGO/Free Item)
   - Set date range
   - Activate promotion

4. **Analytics**
   - View analytics dashboard
   - Filter by date range (7d, 30d, 90d, 1y)
   - Export analytics to CSV

**✅ Expected**: All features work with proper INR formatting

---

### Scenario 4: Delivery Web Features (3 minutes)

1. **Availability Toggle**
   - Toggle Available/Offline
   - Verify state persists on refresh

2. **Earnings Dashboard**
   - Complete a delivery
   - Navigate to Earnings page
   - Verify earnings display (INR)
   - Check breakdowns (today, weekly, monthly)

3. **Photo & Signature**
   - Accept delivery task
   - Click "Capture Delivery Photo"
   - Grant camera permission
   - Capture and verify photo saved
   - Click "Get Customer Signature"
   - Draw signature and save
   - Mark as delivered (requires both photo + signature)

**✅ Expected**: All delivery features work with proper validation

---

### Scenario 5: Admin Dashboard Features (5 minutes)

1. **Advanced Tables**
   - Orders table: Search, sort, export
   - Restaurants table: Filter, export
   - Customers table: Search, export
   - Delivery Partners table: Filter, export

2. **Restaurant Approvals** (RBAC)
   - Navigate to Approvals
   - View pending restaurants
   - Approve/Reject with notes

3. **Support Tickets** (RBAC)
   - Navigate to Tickets
   - Create ticket
   - Add messages
   - Update status

4. **Platform Analytics** (RBAC)
   - Navigate to Analytics
   - View charts (revenue, orders, users)
   - Check different time periods

**✅ Expected**: All features work with RBAC permissions

---

## 🔍 Quick Verification Checklist

### All Interfaces
- [ ] Services start successfully
- [ ] Login works
- [ ] WebSocket connects (Live badge)
- [ ] Real-time updates work
- [ ] INR currency displays correctly
- [ ] Responsive design works

### Customer Web
- [ ] Restaurant search/filter works
- [ ] Add to cart works
- [ ] Promo code applies
- [ ] Order placement works
- [ ] Real-time tracking works

### Restaurant Dashboard
- [ ] Real-time order notifications
- [ ] Menu CRUD operations
- [ ] Staff scheduling works
- [ ] Promotions work
- [ ] Analytics display correctly

### Delivery Web
- [ ] Availability toggle works
- [ ] Photo capture works
- [ ] Signature capture works
- [ ] Earnings display correctly
- [ ] Task management works

### Admin Dashboard
- [ ] DataTables work (sort, search, export)
- [ ] RBAC permissions enforced
- [ ] Approvals workflow works
- [ ] Support tickets work
- [ ] Analytics display correctly

---

## 🐛 Quick Troubleshooting

### WebSocket Not Connecting
```bash
# Check order service is running
docker-compose ps order-service

# Check nginx WebSocket config
docker-compose exec nginx nginx -t

# Check logs
docker-compose logs order-service
```

### Services Not Starting
```bash
# Check Docker logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose up -d --build
```

### Database Connection Issues
```bash
# Check database containers
docker-compose ps postgres_db mongo_db

# Check connection strings in environment variables
docker-compose config
```

---

## 📊 Test Scripts

### Automated Test Suite

**PowerShell**:
```powershell
.\test-suite.ps1
```

**Bash**:
```bash
chmod +x test-suite.sh
./test-suite.sh
```

---

## 🎯 Critical Test Cases

### Must Pass Before Production

1. ✅ Complete order flow works end-to-end
2. ✅ WebSocket real-time updates work
3. ✅ All prices display in INR
4. ✅ RBAC permissions enforced
5. ✅ Photo + Signature required for delivery
6. ✅ DataTables work (search, sort, export)
7. ✅ Multi-stage Docker builds succeed
8. ✅ Health checks pass
9. ✅ Services communicate via Docker network
10. ✅ WebSocket works through nginx proxy

---

*Last Updated: Phase 1-6 Complete*
*Version: 2.0*
