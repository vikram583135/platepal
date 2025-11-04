# PlatePal - Local Development Setup Guide

## 📋 Overview

This guide covers setting up PlatePal for local development, including all backend services, frontend applications, databases, and WebSocket communication.

---

## Prerequisites

### Required Software

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

### Optional (For Docker)

- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)

---

## 🚀 Quick Start (Docker)

If you have Docker installed, the fastest way to get started:

```bash
# Clone repository
git clone <repository-url>
cd platepal

# Start all services
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f
```

All services will be available:
- Restaurant Dashboard: http://localhost:3004
- Admin Dashboard: http://localhost:3005
- Customer Web: http://localhost:3006
- Delivery Web: http://localhost:3007
- APIs: http://localhost:3001-3003

---

## 🔧 Local Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd platepal
```

### Step 2: Database Setup

#### PostgreSQL

1. **Install PostgreSQL** (if not already installed)

2. **Create Database**

```sql
CREATE DATABASE platepal_db;
CREATE USER platepal_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE platepal_db TO platepal_user;
```

3. **Update Connection Strings**

Update database connection in:
- `backend/user-service/.env`
- `backend/restaurant-service/.env`
- `backend/order-service/.env`

#### MongoDB

1. **Install MongoDB** (if not already installed)

2. **Start MongoDB**

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data
```

3. **Update Connection String**

Update in `backend/restaurant-service/.env`:
```
MONGO_URL=mongodb://localhost:27017/platepal_menus
```

### Step 3: Backend Services Setup

#### User Service

```bash
cd backend/user-service

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=platepal_user
DB_PASSWORD=your_password
DB_NAME=platepal_db
JWT_SECRET=your_jwt_secret_key_here
PORT=3001
CORS_ORIGIN=http://localhost:3004,http://localhost:3005,http://localhost:3006,http://localhost:3007
EOF

# Start development server
npm run start:dev
```

#### Restaurant Service

```bash
cd backend/restaurant-service

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=platepal_user
DB_PASSWORD=your_password
DB_NAME=platepal_db
MONGO_URL=mongodb://localhost:27017/platepal_menus
JWT_SECRET=your_jwt_secret_key_here
PORT=3002
CORS_ORIGIN=http://localhost:3004,http://localhost:3005,http://localhost:3006
EOF

# Start development server
npm run start:dev
```

#### Order Service

```bash
cd backend/order-service

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=platepal_user
DB_PASSWORD=your_password
DB_NAME=platepal_db
JWT_SECRET=your_jwt_secret_key_here
PORT=3003
CORS_ORIGIN=http://localhost:3006,http://localhost:3004,http://localhost:3007,http://localhost:3005
EOF

# Start development server
npm run start:dev
```

### Step 4: Frontend Services Setup

#### Customer Web

```bash
cd customer-web

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_ORDER_URL=http://localhost:3003
NEXT_PUBLIC_WS_URL=ws://localhost:3003
EOF

# Start development server
npm run dev
```

Access at: http://localhost:3006

#### Restaurant Dashboard

```bash
cd restaurant-dashboard

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_ORDER_URL=http://localhost:3003
NEXT_PUBLIC_WS_URL=ws://localhost:3003
EOF

# Seed restaurants (optional)
npm run seed

# Start development server
npm run dev
```

Access at: http://localhost:3004

**Login Credentials**: See `restaurant-dashboard/RESTAURANT_CREDENTIALS.md`

#### Delivery Web

```bash
cd delivery-web

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_ORDER_URL=http://localhost:3003
NEXT_PUBLIC_WS_URL=ws://localhost:3003
EOF

# Start development server
npm run dev
```

Access at: http://localhost:3007

#### Admin Dashboard

```bash
cd admin-dashboard

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_ORDER_URL=http://localhost:3003
NEXT_PUBLIC_WS_URL=ws://localhost:3003
EOF

# Start development server
npm run dev
```

Access at: http://localhost:3005

---

## 🧪 Testing Setup

### Seed Test Data

#### Restaurants

```bash
cd restaurant-dashboard
npm run seed
```

This creates 12 restaurants with 200+ menu items. Credentials are saved in `RESTAURANT_CREDENTIALS.md`.

### Run Test Suite

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

Follow [MANUAL_TESTING_CHECKLIST.md](./MANUAL_TESTING_CHECKLIST.md) for comprehensive testing.

---

## 🌐 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| User Service | 3001 | http://localhost:3001 |
| Restaurant Service | 3002 | http://localhost:3002 |
| Order Service | 3003 | http://localhost:3003 |
| Restaurant Dashboard | 3004 | http://localhost:3004 |
| Admin Dashboard | 3005 | http://localhost:3005 |
| Customer Web | 3006 | http://localhost:3006 |
| Delivery Web | 3007 | http://localhost:3007 |
| PostgreSQL | 5432 | localhost:5432 |
| MongoDB | 27017 | localhost:27017 |

---

## 🔌 WebSocket Configuration

### Development

WebSocket connections use:
- **Order Service**: `ws://localhost:3003`

### Production/Docker

WebSocket connections use:
- **Order Service**: `ws://order-service:3003` (internal)
- **Via Nginx**: `ws://localhost/socket.io/` (external)

### Testing WebSocket Connection

1. Open browser DevTools → Network → WS
2. Navigate to a page that uses WebSocket (Orders, Track, Dashboard)
3. Verify WebSocket connection appears
4. Check connection status indicator (Live/Offline badge)

---

## 📦 Environment Variables

### Backend Services

**Common Variables**:
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=platepal_user
DB_PASSWORD=your_password
DB_NAME=platepal_db
JWT_SECRET=your_jwt_secret_key_here
PORT=300X
CORS_ORIGIN=http://localhost:3004,http://localhost:3005,http://localhost:3006,http://localhost:3007
```

**Restaurant Service Additional**:
```env
MONGO_URL=mongodb://localhost:27017/platepal_menus
```

### Frontend Services

**Common Variables**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_ORDER_URL=http://localhost:3003
NEXT_PUBLIC_WS_URL=ws://localhost:3003
```

---

## 🛠️ Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Docker
- PostgreSQL

### Debugging

#### Backend (NestJS)

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "restart": true
    }
  ]
}
```

#### Frontend (Next.js)

Next.js debugging works out of the box. Use Chrome DevTools for debugging.

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
# Windows
netstat -ano | findstr :3001

# macOS/Linux
lsof -i :3001

# Kill process
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

### Database Connection Issues

1. **Check PostgreSQL is running**:
```bash
# Windows
services.msc (look for PostgreSQL)

# macOS/Linux
sudo systemctl status postgresql
```

2. **Check MongoDB is running**:
```bash
# Windows
services.msc (look for MongoDB)

# macOS/Linux
sudo systemctl status mongod
```

3. **Verify connection strings** in `.env` files

### WebSocket Not Connecting

1. Check Order Service is running on port 3003
2. Check CORS configuration
3. Verify WebSocket URL in frontend `.env.local`
4. Check browser console for errors

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

### TypeScript Errors

```bash
# Regenerate TypeScript build info
rm -rf tsconfig.tsbuildinfo
npm run build
```

---

## 📝 Development Workflow

### Starting Development

1. Start databases (PostgreSQL, MongoDB)
2. Start backend services (in separate terminals)
3. Start frontend services (in separate terminals)
4. Open browsers to respective URLs

### Making Changes

1. **Backend**: Changes auto-reload with `npm run start:dev`
2. **Frontend**: Changes hot-reload with `npm run dev`
3. **Database**: Run migrations if schema changes

### Testing Changes

1. Run automated test suite
2. Manual testing using checklist
3. Check WebSocket connections
4. Verify currency formatting (INR)

---

## 🚢 Switching Between Docker and Local

### From Docker to Local

1. Stop Docker services: `docker-compose down`
2. Start databases locally
3. Update `.env` files with local database URLs
4. Start services locally

### From Local to Docker

1. Stop local services
2. Start Docker: `docker-compose up -d`
3. Services use Docker network URLs

---

## 📚 Additional Resources

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Comprehensive testing guide
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker configuration
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing procedures
- [COMPLETE_PROJECT_PROGRESS.md](./COMPLETE_PROJECT_PROGRESS.md) - Project status

---

## ✅ Verification Checklist

Before starting development, verify:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and running
- [ ] MongoDB installed and running
- [ ] Databases created
- [ ] Backend services start successfully
- [ ] Frontend services start successfully
- [ ] WebSocket connections work
- [ ] Test data seeded (optional)
- [ ] All ports available

---

*Last Updated: Phase 1-6 Complete*
*Version: 2.0*
