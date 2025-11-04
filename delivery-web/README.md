# PlatePal Delivery Web App

Mobile-responsive web application for delivery partners to manage and complete delivery tasks.

## Features

- Delivery partner authentication
- Real-time task notifications
- Task acceptance and management
- Active delivery tracking
- Status updates (picked up, delivered)
- Navigation integration
- Mobile-optimized UI

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3007](http://localhost:3007)

## Build

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t platepal-delivery-web .
docker run -p 3007:3000 platepal-delivery-web
```

## Environment Variables

- `NEXT_PUBLIC_AUTH_URL` - User service URL
- `NEXT_PUBLIC_API_URL` - Order service URL

## Test Credentials

- Email: driver1@delivery.com
- Password: password123

