# 🔧 Seeding Script Troubleshooting Guide

## The Issue
The seeding script failed with: `Cannot POST /auth/register/restaurant`

This means the backend API endpoint doesn't match what the script expects.

---

## ✅ Fixed in Latest Version
The seeding script has been updated to try multiple registration methods. Run it again:

```powershell
cd C:\Users\sanvi\platepal\restaurant-dashboard
.\scripts\run-seed.ps1
```

---

## 🔍 Pre-Flight Checklist

### 1. Verify Backend Services Are Running
```powershell
cd C:\Users\sanvi\platepal
docker-compose ps
```

**Expected output**: All these should show "Up"
- postgres
- mongodb
- user-service (port 3001)
- restaurant-service (port 3002)
- order-service (port 3003)

If any are not running:
```powershell
docker-compose up -d user-service restaurant-service order-service
```

---

### 2. Test User Service Endpoint
```powershell
# Test if user service is responding
curl http://localhost:3001/health

# Or in PowerShell
Invoke-RestMethod -Uri http://localhost:3001/health
```

**Expected**: Should return a health check response

---

### 3. Check Service Logs
```powershell
# Check user service logs
docker-compose logs user-service --tail=50

# Check restaurant service logs
docker-compose logs restaurant-service --tail=50
```

Look for any error messages or startup issues.

---

## 🛠️ Manual Testing

### Test Registration Manually
Try registering a test restaurant manually to verify the endpoint works:

```powershell
# Option 1: Test basic registration
Invoke-RestMethod -Uri http://localhost:3001/auth/register -Method POST -Body (@{
    name = "Test Restaurant"
    email = "test@restaurant.com"
    password = "test123"
} | ConvertTo-Json) -ContentType "application/json"

# Option 2: Test with role field
Invoke-RestMethod -Uri http://localhost:3001/auth/register -Method POST -Body (@{
    name = "Test Restaurant"
    email = "test2@restaurant.com"
    password = "test123"
    role = "RESTAURANT"
} | ConvertTo-Json) -ContentType "application/json"
```

**Expected**: Should return a token or user object

---

## 🔄 Alternative: Use Existing Restaurants

If the seeding continues to fail, you can:

### Option 1: Create Restaurants Manually
1. Go to http://localhost:3004/register
2. Create restaurant accounts manually
3. Use those credentials to test the dashboard

### Option 2: Use Script to Create One Restaurant at a Time

Create a simplified test script:

```powershell
# Create file: test-single-restaurant.ps1
cd C:\Users\sanvi\platepal\restaurant-dashboard

# Install dependencies if needed
npm install

# Test with a single restaurant
$body = @{
    name = "Test Italian Restaurant"
    email = "italian.test@platepal.com"
    password = "italian123"
    role = "RESTAURANT"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:3001/auth/register -Method POST -Body $body -ContentType "application/json"

Write-Host "Registration successful!"
Write-Host "Email: italian.test@platepal.com"
Write-Host "Password: italian123"
Write-Host "Token: $($response.accessToken)"
```

---

## 📋 Common Issues & Solutions

### Issue: "Connection refused" or "ECONNREFUSED"
**Solution**: Backend services aren't running
```powershell
cd C:\Users\sanvi\platepal
docker-compose up -d
```

### Issue: "Cannot POST /auth/register"
**Solution**: The endpoint might be different. Check the user-service API documentation or logs.

### Issue: "Email already exists"
**Solution**: The script previously registered some restaurants. Either:
- Use different email addresses in the script
- Clear the database: `docker-compose down -v` then `docker-compose up -d`

### Issue: "Unauthorized" when creating restaurant profile
**Solution**: Registration succeeded but token format is wrong. Check the token extraction in the script.

---

## 🎯 Verify Successful Seeding

After the script runs successfully, you should see:

1. **Console Output**:
   ```
   ✓ Successfully created: 12/12 restaurants
   ✓ Total menu items added: 200+
   ```

2. **Credentials File Created**:
   - Check for `RESTAURANT_CREDENTIALS.md` in the restaurant-dashboard folder
   - Should contain login details for all restaurants

3. **Test Login**:
   - Go to http://localhost:3004/login
   - Use any credentials from `RESTAURANT_CREDENTIALS.md`
   - Should successfully log in and see the dashboard

---

## 🆘 Still Having Issues?

1. **Check Docker Logs**:
   ```powershell
   docker-compose logs --tail=100
   ```

2. **Restart Everything**:
   ```powershell
   docker-compose down
   docker-compose up -d
   # Wait 30 seconds for services to start
   .\scripts\run-seed.ps1
   ```

3. **Check Service Health**:
   ```powershell
   # User service
   curl http://localhost:3001/health
   
   # Restaurant service
   curl http://localhost:3002/health
   
   # Order service
   curl http://localhost:3003/health
   ```

4. **Manual Database Check**:
   ```powershell
   # Connect to PostgreSQL
   docker-compose exec postgres psql -U platepal -d platepal
   
   # Check users table
   SELECT * FROM users LIMIT 5;
   
   # Exit
   \q
   ```

---

## 📞 Debug Mode

Run the seeding script with full error output:

```powershell
cd restaurant-dashboard
$env:NODE_ENV="development"
npx tsx scripts/seed-restaurants.ts
```

This will show detailed error messages to help identify the issue.

---

## ✅ Success Indicators

You'll know seeding worked when:
- ✅ Console shows "Successfully created: 12/12 restaurants"
- ✅ `RESTAURANT_CREDENTIALS.md` file exists
- ✅ You can log in with any credentials from the file
- ✅ Dashboard shows restaurant data

---

## 🚀 Next Steps After Successful Seeding

1. Open http://localhost:3004
2. Log in with any restaurant credentials
3. Explore the enhanced dashboard
4. Test all the new features
5. Check that all prices show in INR (₹)

---

**Updated**: October 26, 2024  
**Status**: Script updated with better error handling and multiple endpoint attempts

