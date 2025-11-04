# Customer Web Docker Deployment Guide

## Important: Environment Variables at Build Time

**Critical**: `NEXT_PUBLIC_*` environment variables are baked into the JavaScript bundle at **build time**, not runtime. They must be passed as build arguments to the Dockerfile.

## Building with New Enhancements

### 1. Rebuild the Image
```bash
docker-compose build --no-cache customer-web
```

### 2. Restart the Container
```bash
docker-compose up -d --force-recreate customer-web
```

### 3. Clear Browser Cache
After rebuilding, users must:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache
- Or use incognito/private mode

## Why New Features Don't Appear

If new enhancements aren't showing up:

1. **Build Cache**: Next.js caches builds. Use `--no-cache` flag
2. **Browser Cache**: Old JavaScript bundle is cached. Clear browser cache
3. **Environment Variables**: Must be set as build args, not runtime env vars

## Verification Steps

### Check if Payment Page Exists
```bash
docker exec platepal-customer-web sh -c "ls -la /app/.next/server/app/payment"
```

### Check Environment Variables in Build
```bash
docker exec platepal-customer-web sh -c "grep -r 'NEXT_PUBLIC_USE_NGINX_PROXY' /app/.next/static/chunks/*.js | head -1"
```

### Test Payment Route
```bash
curl http://localhost:3006/payment
```

## New Features Included

✅ Multi-restaurant cart support
✅ Payment page (`/payment`)
✅ INR currency (₹)
✅ Indian address format
✅ Image generation (Unsplash)
✅ Enhanced UI/UX (glassmorphism)

All features are included in the build. If not visible:
1. Rebuild with `--no-cache`
2. Restart container
3. Clear browser cache

