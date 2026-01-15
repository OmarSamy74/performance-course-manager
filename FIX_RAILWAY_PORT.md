# 🔧 Fix Railway Port Configuration

## Problem

Railway networking is configured to route to port **8080**, but the server might be listening on a different port.

---

## Solution

Railway automatically sets the `PORT` environment variable. You need to configure Railway's networking to match.

### Option 1: Use Railway's Auto-Detected PORT (Recommended)

1. **Check Railway Environment Variables**:
   - Railway Dashboard → Your Service → Variables
   - Look for `PORT` variable (Railway sets this automatically)
   - Note the port number (usually `3001` or similar)

2. **Update Railway Networking**:
   - Railway Dashboard → Your Service → **Settings** → **Networking**
   - Find **"Public Networking"** section
   - Click on your domain: `performance-course-manager-production.up.railway.app`
   - In the **"Target port"** field, enter the port from step 1 (e.g., `3001`)
   - Click **"Update"**

3. **Verify**:
   - Railway should now route traffic correctly
   - Your app should be accessible

### Option 2: Force Server to Use Port 8080

If you want to use port 8080 specifically:

1. **Set Environment Variable in Railway**:
   - Railway Dashboard → Your Service → Variables
   - Add/Update: `PORT=8080`

2. **Update Railway Networking**:
   - Railway Dashboard → Your Service → **Settings** → **Networking**
   - Set **"Target port"** to `8080`
   - Click **"Update"**

3. **Redeploy**:
   - Railway will automatically redeploy with the new port

---

## How It Works

### Server Configuration

The server is configured to listen on:
```typescript
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

This means:
- ✅ Uses `PORT` environment variable if set (Railway sets this automatically)
- ✅ Falls back to `3001` if not set (local development)

### Railway Port Detection

Railway automatically:
1. Detects which port your app is listening on
2. Sets the `PORT` environment variable
3. Routes traffic to that port

**But** you need to configure the networking target port to match.

---

## Step-by-Step Fix

### Step 1: Check Current PORT

1. Go to Railway Dashboard → Your Service → **Variables**
2. Look for `PORT` variable
3. Note the value (e.g., `3001`)

### Step 2: Update Networking

1. Go to Railway Dashboard → Your Service → **Settings** → **Networking**
2. Under **"Public Networking"**, find your domain
3. Click on the domain or the **"..."** menu
4. Click **"Edit"** or **"Update"**
5. In **"Target port"**, enter the PORT value from Step 1
6. Click **"Update"**

### Step 3: Verify

1. Check Railway logs:
   ```
   🚀 Server running on port 3001
   ```
   (or whatever port is set)

2. Test your domain:
   ```
   https://performance-course-manager-production.up.railway.app
   ```

3. Should load your application

---

## Common Port Values

| Environment | Default Port | Railway Auto-Set |
|-------------|--------------|-----------------|
| Local Dev | `3001` | - |
| Railway | `PORT` env var | Usually `3001` or `8080` |

---

## Troubleshooting

### Issue 1: Port Mismatch

**Symptom**: App not accessible, connection refused

**Fix**: Ensure Railway networking target port matches the PORT environment variable

### Issue 2: PORT Not Set

**Symptom**: Server logs show port 3001 but Railway routes to 8080

**Fix**: 
1. Set `PORT=8080` in Railway variables
2. Update networking target port to `8080`
3. Redeploy

### Issue 3: Multiple Services

**Symptom**: Confusion about which port to use

**Fix**: 
- Each service has its own PORT
- Check the specific service's variables
- Configure networking for that service

---

## Quick Fix

**If you want to use port 8080** (as shown in Railway):

1. **Railway Dashboard** → Your Service → **Variables**
2. Add/Update: `PORT=8080`
3. **Settings** → **Networking** → Your Domain
4. Set **Target port**: `8080`
5. Click **Update**
6. Wait for redeploy

**If Railway auto-detected a different port** (e.g., 3001):

1. **Settings** → **Networking** → Your Domain
2. Set **Target port**: `3001` (or whatever PORT env var shows)
3. Click **Update**

---

## Verification

After updating:

1. **Check Railway Logs**:
   ```
   🚀 Server running on port 8080
   ```
   (or whatever port you configured)

2. **Test Domain**:
   ```
   curl https://performance-course-manager-production.up.railway.app/api/auth
   ```
   Should return a response (even if error, means port is correct)

3. **Check Browser**:
   - Visit your domain
   - Should load the application

---

## Notes

- Railway automatically sets `PORT` environment variable
- The server listens on whatever `PORT` is set to
- Railway networking needs to route to the same port
- Port configuration is per-service

---

**Update the target port in Railway networking to match your PORT environment variable! 🚀**
