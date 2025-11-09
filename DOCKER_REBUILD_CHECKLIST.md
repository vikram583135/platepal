# Docker Rebuild Checklist - Safety-First Enhancements

## Pre-Rebuild Checklist

- [ ] Docker Desktop is running
- [ ] All code changes are saved
- [ ] No critical errors in codebase
- [ ] Backed up current Docker images (optional)

## Files Changed (Ready for Docker)

### Frontend (delivery-web)
✅ **New Components:**
- `components/MissionView.tsx`
- `components/VoiceAssistant.tsx`
- `components/GlanceableMap.tsx`
- `components/NavigationOverlay.tsx`
- `components/SmartNotification.tsx`
- `components/EarningsPredictor.tsx`
- `components/OrderBatchCard.tsx`

✅ **Updated Pages:**
- `app/active/page.tsx`
- `app/dashboard/page.tsx`

✅ **New Hooks:**
- `lib/hooks/useVoiceAssistant.ts`

✅ **Updated Files:**
- `lib/store.ts`
- `lib/api.ts`
- `app/globals.css`

### Backend (order-service)
✅ **New Modules:**
- `src/route-optimization/` (4 files)
- `src/earnings-prediction/` (3 files)
- `src/notification-intelligence/` (3 files)

✅ **Updated Files:**
- `src/app.module.ts`

## Rebuild Steps

### Step 1: Stop Services
```bash
docker-compose down
```

### Step 2: Rebuild Frontend
```bash
docker-compose build --no-cache delivery-web
```

**Expected Output:**
- Builds successfully
- No TypeScript errors
- All components compiled
- Image size: ~250MB

### Step 3: Rebuild Backend
```bash
docker-compose build --no-cache order-service
```

**Expected Output:**
- Builds successfully
- No compilation errors
- All modules registered
- Image size: ~200MB

### Step 4: Start Services
```bash
docker-compose up -d
```

### Step 5: Verify
```bash
# Check containers
docker-compose ps

# View logs
docker-compose logs -f delivery-web
docker-compose logs -f order-service
```

## Post-Rebuild Verification

### Frontend Verification
1. Access http://localhost:3007
2. Login with test credentials
3. Check dashboard loads
4. Verify Mission View toggle works
5. Verify Voice Assistant button appears
6. Check batch offers display (if available)
7. Verify earnings predictor shows

### Backend Verification
1. Check order-service logs for errors
2. Test API endpoints:
   - `GET http://localhost:3003/route-optimization/available-batches?lat=28.6&lng=77.2`
   - `GET http://localhost:3003/earnings-prediction/1`
   - `GET http://localhost:3003/notifications/proactive/1`

## Troubleshooting

### Build Fails with TypeScript Errors
**Solution**: Check all files are saved and no syntax errors

### Build Fails with Module Not Found
**Solution**: Verify all modules imported in `app.module.ts`

### Container Won't Start
**Solution**: Check logs with `docker-compose logs [service-name]`

### API Endpoints Not Working
**Solution**: Verify order-service is running and healthy

---

*Ready for Docker rebuild when Docker Desktop is running*

