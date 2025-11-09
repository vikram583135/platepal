# Docker Update Guide - Safety-First Delivery Web Enhancements

## Overview

This guide covers updating Docker containers with all new safety-first UI enhancements and AI-powered features.

## New Features Added

### Frontend (delivery-web)
- MissionView component (task-centric high-contrast display)
- VoiceAssistant component (hands-free commands)
- GlanceableMap component (full-screen map with location tracking)
- NavigationOverlay component (next turn, time, call buttons)
- SmartNotification component (contextual alerts)
- EarningsPredictor component (AI-powered predictions)
- OrderBatchCard component (batch delivery offers)
- Enhanced state management (mission state, voice assistant, map mode, etc.)

### Backend (order-service)
- Route Optimization Service (order batching algorithm)
- Route Optimization Controller (API endpoints)
- Earnings Prediction Service (historical data analysis)
- Earnings Prediction Controller (API endpoint)
- Notification Intelligence Service (restaurant busy times, parking difficulty)
- Notification Intelligence Controller (API endpoints)

## Docker Update Steps

### 1. Stop Running Containers

```bash
docker-compose down
```

### 2. Rebuild Frontend (delivery-web)

```bash
docker-compose build --no-cache delivery-web
```

**What's Changed:**
- New components in `components/` directory
- Updated pages in `app/` directory
- New hooks in `lib/hooks/`
- Enhanced API methods in `lib/api.ts`
- Updated state management in `lib/store.ts`
- Enhanced global styles in `app/globals.css`

### 3. Rebuild Backend (order-service)

```bash
docker-compose build --no-cache order-service
```

**What's Changed:**
- New route-optimization module
- New earnings-prediction module
- New notification-intelligence module
- Updated app.module.ts with new module imports

### 4. Rebuild All Services (Alternative)

```bash
docker-compose build --no-cache
```

### 5. Start Services

```bash
docker-compose up -d
```

### 6. Verify Services

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f delivery-web
docker-compose logs -f order-service

# Check health
docker-compose ps --format "table {{.Name}}\t{{.Status}}"
```

## New API Endpoints

### Route Optimization
- `GET /route-optimization/available-batches?lat={lat}&lng={lng}&maxBatchSize={size}`
- `POST /route-optimization/optimize-route`
- `GET /route-optimization/available-batches/:lat/:lng`

### Earnings Prediction
- `GET /earnings-prediction/:partnerId?hours={hours}&area={area}`
- `GET /earnings-prediction/:partnerId/stats`

### Smart Notifications
- `GET /notifications/smart/:orderId`
- `GET /notifications/proactive/:partnerId`

## Environment Variables

No new environment variables required. All services use existing configuration.

## Verification Checklist

After updating Docker containers, verify:

- [ ] delivery-web container starts successfully
- [ ] order-service container starts successfully
- [ ] Mission View displays correctly
- [ ] Voice Assistant works (if browser supports Web Speech API)
- [ ] Map view shows in active delivery page
- [ ] Batch offers appear in dashboard
- [ ] Earnings predictor displays predictions
- [ ] Smart notifications appear when applicable
- [ ] All API endpoints respond correctly

## Troubleshooting

### Build Errors

1. **TypeScript errors**: Ensure all new files are saved
2. **Missing dependencies**: Check `package.json` files
3. **Module import errors**: Verify all modules are registered in `app.module.ts`

### Runtime Errors

1. **API connection errors**: Check environment variables
2. **Database connection errors**: Ensure PostgreSQL is running
3. **WebSocket errors**: Verify order-service WebSocket gateway is working

### Frontend Issues

1. **Voice Assistant not working**: Check browser compatibility (Chrome/Edge recommended)
2. **Map not showing**: Implement actual mapping service (Google Maps/Mapbox)
3. **Location tracking errors**: Check browser permissions for geolocation

## Rollback

If issues occur, you can rollback:

```bash
# Stop containers
docker-compose down

# Remove new images
docker rmi platepal-delivery-web:latest
docker rmi platepal-order-service:latest

# Rebuild from previous commit
git checkout <previous-commit>
docker-compose build --no-cache
docker-compose up -d
```

## Performance Notes

- Map components use mock coordinates (replace with geocoding service in production)
- Voice Assistant requires browser Web Speech API support
- Route optimization uses nearest-neighbor algorithm (can be enhanced with ML)
- Earnings prediction uses historical averages (can be enhanced with ML models)

## Next Steps for Production

1. **Integrate Real Mapping Service**:
   - Google Maps JavaScript API
   - Mapbox GL JS
   - Leaflet with OpenStreetMap

2. **Enhance Route Optimization**:
   - Add real-time traffic data
   - Implement ML-based route prediction
   - Add time window constraints

3. **Improve Earnings Prediction**:
   - Add ML models for better accuracy
   - Include weather data
   - Add competitor analysis

4. **Expand Smart Notifications**:
   - Integrate weather APIs
   - Add real-time traffic APIs
   - Implement parking availability APIs

---

*Last Updated: After Safety-First UI Implementation*
*Version: 3.0*

