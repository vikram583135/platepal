# PlatePal - Food Delivery Platform

A comprehensive full-stack food delivery application built with modern microservices architecture, featuring customer mobile apps, restaurant dashboards, delivery partner apps, and admin panels.

## 🏗️ Architecture Overview

PlatePal is built using a microservices architecture with the following components:

### Backend Services (NestJS)
- **User Service** (Port 3001) - Authentication and user management
- **Restaurant Service** (Port 3002) - Restaurant and menu management
- **Order Service** (Port 3003) - Order processing and real-time updates

### Frontend Applications
- **Customer Mobile App** (React Native) - iOS and Android app for customers
- **Restaurant Dashboard** (Next.js) - Web dashboard for restaurant partners
- **Delivery Partner App** (React Native) - Mobile app for delivery partners
- **Admin Dashboard** (Next.js) - Administrative interface

### Databases
- **PostgreSQL** - User data, restaurants, orders
- **MongoDB** - Menu data and documents

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- React Native development environment (for mobile apps)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/platepal.git
   cd platepal
   ```

2. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

3. **Install dependencies for each service**
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

4. **Start development servers**
   ```bash
   # Backend services
   cd backend/user-service && npm run start:dev
   cd ../restaurant-service && npm run start:dev
   cd ../order-service && npm run start:dev

   # Frontend applications
   cd ../../restaurant-dashboard && npm run dev
   cd ../admin-dashboard && npm run dev

   # Mobile apps
   cd ../CustomerApp && npm run android  # or npm run ios
   cd ../delivery-app/DeliveryApp && npm run android  # or npm run ios
   ```

## 📱 Application Interfaces

### Customer Mobile App
- **Login/Register** - User authentication
- **Restaurant Discovery** - Browse available restaurants
- **Menu Browsing** - View restaurant menus with search
- **Cart Management** - Add items, modify quantities
- **Order Placement** - Secure checkout process
- **Real-time Tracking** - Track order status via WebSocket

### Restaurant Dashboard
- **Authentication** - Secure login for restaurant partners
- **Menu Management** - Add, edit, delete menu items
- **Order Management** - View and manage incoming orders
- **Analytics** - Sales and performance metrics

### Delivery Partner App
- **Partner Login** - Authentication for delivery partners
- **Task Dashboard** - View available delivery tasks
- **Task Acceptance** - Accept/reject delivery tasks
- **Navigation** - Built-in navigation assistance
- **Status Updates** - Update delivery status

### Admin Dashboard
- **System Overview** - Key metrics and statistics
- **User Management** - Manage customers, restaurants, delivery partners
- **Order Monitoring** - Track all orders across the platform
- **Analytics** - Comprehensive business analytics
- **System Configuration** - Platform settings and configuration

## 🛠️ Development

### Project Structure
```
platepal/
├── backend/
│   ├── user-service/          # Authentication service
│   ├── restaurant-service/    # Restaurant & menu service
│   └── order-service/         # Order processing service
├── CustomerApp/              # Customer mobile app
├── delivery-app/
│   └── DeliveryApp/          # Delivery partner app
├── restaurant-dashboard/     # Restaurant web dashboard
├── admin-dashboard/          # Admin web dashboard
├── docker-compose.yml       # Container orchestration
├── nginx.conf              # Reverse proxy configuration
└── .github/workflows/      # CI/CD pipelines
```

### API Endpoints

#### User Service (Port 3001)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /users/profile` - Get user profile

#### Restaurant Service (Port 3002)
- `GET /restaurants` - List all restaurants
- `GET /restaurants/:id/menu` - Get restaurant menu
- `PUT /restaurants/:id/menu` - Update restaurant menu (Protected)

#### Order Service (Port 3003)
- `POST /orders` - Create new order
- `GET /orders` - List orders (Protected)
- WebSocket: Real-time order updates

### Database Schema

#### PostgreSQL Tables
- `users` - User accounts and profiles
- `restaurants` - Restaurant information
- `orders` - Order records and status

#### MongoDB Collections
- `menus` - Restaurant menu items and categories

## 🐳 Docker Deployment

### Production Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Service URLs (Development)
- User Service: http://localhost:3001
- Restaurant Service: http://localhost:3002
- Order Service: http://localhost:3003
- Restaurant Dashboard: http://localhost:3004
- Admin Dashboard: http://localhost:3005
- Nginx Proxy: http://localhost:80

## 🧪 Testing

### Backend Testing
```bash
# Run tests for each service
cd backend/user-service && npm test
cd ../restaurant-service && npm test
cd ../order-service && npm test
```

### Frontend Testing
```bash
# Test web applications
cd restaurant-dashboard && npm test
cd ../admin-dashboard && npm test
```

### Mobile App Testing
```bash
# Test React Native apps
cd CustomerApp && npm test
cd ../delivery-app/DeliveryApp && npm test
```

## 🔧 Configuration

### Environment Variables

#### Backend Services
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
MONGODB_URL=mongodb://user:password@host:port/database
JWT_SECRET=your_jwt_secret_key
PORT=3001
```

#### Frontend Applications
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
```

### Database Configuration
- PostgreSQL: Port 5433 (to avoid conflicts)
- MongoDB: Port 27017

## 📊 Monitoring and Logging

### Health Checks
- All services include health check endpoints
- Docker Compose includes health check configurations
- Nginx provides load balancing and health monitoring

### Logging
- Structured logging across all services
- Centralized logging with Docker Compose
- Log rotation and retention policies

## 🚀 CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow:

1. **Testing** - Automated testing for all services
2. **Building** - Docker image creation
3. **Pushing** - Container registry upload
4. **Deployment** - Automated deployment to production

### Pipeline Features
- Multi-service testing with database services
- Parallel build and push operations
- Security scanning and vulnerability checks
- Automated rollback capabilities

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Token refresh mechanisms

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting

## 📈 Performance

### Optimization Features
- Database indexing and query optimization
- Redis caching for frequently accessed data
- CDN integration for static assets
- Image optimization and compression
- Lazy loading for mobile apps

### Scalability
- Microservices architecture for horizontal scaling
- Load balancing with Nginx
- Database connection pooling
- Stateless service design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in each service directory
- Review the API documentation

## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] User authentication and management
- [x] Restaurant and menu management
- [x] Order processing system
- [x] Real-time order tracking

### Phase 2: Mobile Applications ✅
- [x] Customer mobile app
- [x] Delivery partner app
- [x] Restaurant dashboard
- [x] Admin dashboard

### Phase 3: Advanced Features 🚧
- [ ] Payment integration (Stripe, PayPal)
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark mode themes

### Phase 4: Scale & Optimize 📋
- [ ] Performance optimization
- [ ] Advanced caching strategies
- [ ] Microservices monitoring
- [ ] Automated testing improvements
- [ ] Documentation enhancements

---

**Built with ❤️ using modern web technologies**
