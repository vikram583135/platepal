# 🍽️ PlatePal - Food Delivery Platform

A comprehensive food delivery platform with four distinct interfaces: Customer Web App, Restaurant Dashboard, Delivery Web App, and Admin Dashboard. Built with Next.js, NestJS, PostgreSQL, MongoDB, and real-time WebSocket communication.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Services](#services)
- [Technologies](#technologies)
- [Documentation](#documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## ✨ Features

### 🍽️ Customer Web App
- **Restaurant Browsing**: Search, filter, and sort restaurants
- **Advanced Filtering**: Cuisine, rating, delivery time, price range, dietary restrictions
- **Favorites System**: Save favorite restaurants
- **Shopping Cart**: Add items, apply promo codes, multiple addresses
- **Real-time Order Tracking**: WebSocket-powered live updates
- **Order History**: View past orders with re-order functionality
- **Responsive Design**: Mobile-first, works on all devices
- **Accessibility**: WCAG 2.1 AA compliant

### 🏪 Restaurant Dashboard
- **Real-time Order Management**: WebSocket notifications for new orders
- **Menu Management**: Full CRUD operations, category management, INR pricing
- **Staff Scheduling**: Weekly schedule view with shift management
- **Promotions**: Create discounts, BOGO, and free item promotions
- **Analytics Dashboard**: Revenue trends, order analytics, date range filters
- **Statistics Cards**: Revenue, orders, customers, average order value
- **Data Export**: CSV export for orders, menu, analytics
- **Currency**: All prices in Indian Rupees (₹)

### 🚚 Delivery Web App
- **Availability Toggle**: Set Available/Offline status
- **Task Management**: Accept and complete delivery tasks
- **Photo Proof**: Capture delivery photo with camera
- **Signature Capture**: Customer signature on canvas
- **Earnings Dashboard**: Total, daily, weekly, monthly earnings breakdown
- **Real-time Updates**: WebSocket-powered task assignments
- **Large Touch Targets**: Optimized for mobile use
- **High Visibility**: Designed for outdoor use

### 👨‍💼 Admin Dashboard
- **Platform Analytics**: Revenue charts, user growth, order analytics
- **Restaurant Approvals**: Document review, approval workflow
- **Support Tickets**: Ticket management with priority and categories
- **Advanced DataTables**: Search, sort, pagination, CSV export
- **RBAC**: Role-Based Access Control (super_admin, admin, support, moderator)
- **Customer Management**: View customers, orders, spending
- **Delivery Partner Management**: Ratings, vehicle info, status
- **Real-time Updates**: WebSocket-powered platform statistics

---

## 🏗️ Architecture

### Microservices Architecture

```
┌─────────────────┐
│   Nginx Proxy   │
│   (Port 80/443) │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│User   │ │Rest.  │ │Order  │
│Service│ │Service│ │Service│
│ :3001 │ │ :3002 │ │ :3003 │
└───────┘ └───────┘ └───────┘
    │         │         │
    └────┬────┴────┬────┘
         │         │
    ┌────▼─────────▼──┐
    │   PostgreSQL    │
    │   (Port 5433)   │
    └─────────────────┘

┌─────────────────┐
│    MongoDB      │
│   (Port 27017)  │
└─────────────────┘
```

### Frontend Applications

- **Restaurant Dashboard**: `http://localhost:3004`
- **Admin Dashboard**: `http://localhost:3005`
- **Customer Web**: `http://localhost:3006`
- **Delivery Web**: `http://localhost:3007`

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 15+
- MongoDB

### Docker Setup (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd platepal

# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f
```

### Local Development Setup

See [LOCAL_DEV_SETUP.md](./LOCAL_DEV_SETUP.md) for detailed local development instructions.

```bash
# Backend Services
cd backend/user-service && npm install && npm run start:dev
cd backend/restaurant-service && npm install && npm run start:dev
cd backend/order-service && npm install && npm run start:dev

# Frontend Services
cd customer-web && npm install && npm run dev
cd restaurant-dashboard && npm install && npm run dev
cd delivery-web && npm install && npm run dev
cd admin-dashboard && npm install && npm run dev
```

### Seed Restaurant Data

```bash
cd restaurant-dashboard
npm run seed
```

See `restaurant-dashboard/RESTAURANT_CREDENTIALS.md` for login credentials.

---

## 📁 Project Structure

```
platepal/
├── backend/
│   ├── user-service/          # User authentication & management
│   ├── restaurant-service/     # Restaurant & menu management
│   └── order-service/          # Order management & WebSocket gateway
├── customer-web/               # Customer ordering interface
├── restaurant-dashboard/       # Restaurant management interface
├── delivery-web/               # Delivery partner interface
├── admin-dashboard/            # Admin platform management
├── docker-compose.yml          # Docker orchestration
├── nginx.conf                  # Reverse proxy configuration
└── README.md                   # This file
```

---

## 🔌 Services

### Backend Services

#### User Service (`:3001`)
- User registration and authentication
- JWT token generation
- User profile management

#### Restaurant Service (`:3002`)
- Restaurant CRUD operations
- Menu item management
- MongoDB integration for menus

#### Order Service (`:3003`)
- Order creation and management
- WebSocket gateway for real-time updates
- Delivery assignment
- Order status tracking

### Frontend Services

#### Customer Web (`:3006`)
- Restaurant browsing and search
- Cart and checkout
- Order tracking
- Profile management

#### Restaurant Dashboard (`:3004`)
- Order management
- Menu management
- Staff scheduling
- Analytics and promotions

#### Delivery Web (`:3007`)
- Task management
- Photo and signature capture
- Earnings tracking
- Availability management

#### Admin Dashboard (`:3005`)
- Platform analytics
- Restaurant approvals
- Support tickets
- User management

---

## 🛠️ Technologies

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Zustand** - State management (Customer, Delivery)
- **Redux Toolkit** - State management (Admin)
- **React Query** - Data fetching (Restaurant)
- **Socket.IO Client** - WebSocket communication
- **Recharts** - Data visualization
- **React Hook Form** - Form handling

### Backend
- **NestJS 11** - Node.js framework
- **TypeScript** - Type safety
- **PostgreSQL** - Primary database
- **MongoDB** - Menu storage
- **TypeORM** - ORM for PostgreSQL
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - WebSocket server
- **Passport JWT** - Authentication

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy
- **Alpine Linux** - Lightweight base images

---

## 📚 Documentation

### Setup & Configuration
- [LOCAL_DEV_SETUP.md](./LOCAL_DEV_SETUP.md) - Local development setup
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker configuration guide
- [COLOR_PALETTES.md](./COLOR_PALETTES.md) - Design system colors

### Testing
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Comprehensive testing guide
- [QUICK_TESTING_GUIDE.md](./QUICK_TESTING_GUIDE.md) - Quick test scenarios
- [MANUAL_TESTING_CHECKLIST.md](./MANUAL_TESTING_CHECKLIST.md) - Manual testing checklist

### Project Status
- [COMPLETE_PROJECT_PROGRESS.md](./COMPLETE_PROJECT_PROGRESS.md) - All phases progress
- [RESTAURANT_DASHBOARD_COMPLETE.md](./RESTAURANT_DASHBOARD_COMPLETE.md) - Restaurant features

### Other
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design system guidelines
- [restaurant-dashboard/RESTAURANT_CREDENTIALS.md](./restaurant-dashboard/RESTAURANT_CREDENTIALS.md) - Test credentials

---

## 🧪 Testing

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

### Manual Testing

Follow the [MANUAL_TESTING_CHECKLIST.md](./MANUAL_TESTING_CHECKLIST.md) for comprehensive manual testing.

### Quick Tests

See [QUICK_TESTING_GUIDE.md](./QUICK_TESTING_GUIDE.md) for quick test scenarios.

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check health
docker-compose ps

# View logs
docker-compose logs -f
```

### Production Considerations

1. **Environment Variables**: Update all secrets and URLs
2. **SSL/TLS**: Configure SSL certificates in nginx
3. **Database Backups**: Set up automated backups
4. **Monitoring**: Implement logging and monitoring
5. **Scaling**: Use Docker Swarm or Kubernetes for scaling

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed deployment instructions.

---

## 🌟 Key Features Implemented

### Phase 1-6 Complete ✅

- ✅ Color palettes for all interfaces
- ✅ WebSocket real-time communication
- ✅ Advanced data tables with export
- ✅ RBAC (Role-Based Access Control)
- ✅ Photo and signature capture
- ✅ Earnings tracking
- ✅ Staff scheduling
- ✅ Promotions system
- ✅ Analytics dashboards
- ✅ Error handling and boundaries
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Performance optimizations
- ✅ Multi-stage Docker builds
- ✅ Health checks
- ✅ Currency standardization (INR)

---

## 🔐 Security

- JWT authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS configuration
- WebSocket authentication
- Non-root Docker containers

---

## 📊 Currency

All monetary values are displayed in **Indian Rupees (₹)**.

- Format: ₹1,234.56
- Compact: ₹125K, ₹3.5L, ₹2Cr

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

---

## 📝 License

[Your License Here]

---

## 👥 Support

For issues, questions, or contributions, please open an issue on the repository.

---

## 🎉 Acknowledgments

Built with modern web technologies and best practices for scalability, maintainability, and user experience.

---

*Last Updated: Phase 1-6 Complete*
*Version: 2.0*
