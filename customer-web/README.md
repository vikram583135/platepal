# PlatePal Customer Web App

Mobile-responsive web application for customers to browse restaurants, order food, and track deliveries.

## Features

- Restaurant browsing with search
- Menu viewing with categories
- Shopping cart management
- Order placement
- Real-time order tracking
- User authentication
- Mobile-optimized UI

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3006](http://localhost:3006)

## Build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t platepal-customer-web .
docker run -p 3006:3000 platepal-customer-web
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Restaurant service URL
- `NEXT_PUBLIC_AUTH_URL` - User service URL
- `NEXT_PUBLIC_ORDER_URL` - Order service URL

## Test Credentials

- Email: john@example.com
- Password: password123

