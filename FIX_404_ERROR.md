# 🔧 Fix 404 Errors - API Endpoints

## Problem

Getting 404 errors when trying to access API endpoints. This happens because the API base URL doesn't match your deployment platform.

---

## Solution: Update API Base URL

### For Railway Deployment

If you're using Railway, the API should be at your Railway URL:

1. **Get your Railway URL**: `https://performance-course-manager-production.up.railway.app`

2. **Set Environment Variable**:
   - In Railway Dashboard → Variables
   - Add: `VITE_API_URL=https://performance-course-manager-production.up.railway.app`

3. **Or update `src/api/client.ts`**:
   ```typescript
   const API_BASE = import.meta.env.DEV 
     ? 'http://localhost:3001/api' 
     : (import.meta.env.VITE_API_URL || 'https://performance-course-manager-production.up.railway.app/api');
   ```

### For Netlify Deployment

If you're using Netlify Functions, the API should use Netlify functions:

1. **Update `src/api/client.ts`**:
   ```typescript
   const API_BASE = import.meta.env.DEV 
     ? 'http://localhost:8888/.netlify/functions' 
     : '/.netlify/functions';
   ```

### For Hybrid (Frontend on Netlify, Backend on Railway)

1. **Set Netlify Environment Variable**:
   - Netlify Dashboard → Site settings → Environment variables
   - Add: `VITE_API_URL=https://performance-course-manager-production.up.railway.app/api`

2. **The current code should work** - it uses `VITE_API_URL` if set

---

## Quick Fix

Update `src/api/client.ts` to handle both platforms:

```typescript
// Detect platform and set API base
const getApiBase = () => {
  if (import.meta.env.DEV) {
    // Development: use local server
    return 'http://localhost:3001/api';
  }
  
  // Production: check for custom API URL first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.endsWith('/api') 
      ? import.meta.env.VITE_API_URL 
      : `${import.meta.env.VITE_API_URL}/api`;
  }
  
  // Fallback: check if we're on Netlify (has .netlify in hostname)
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify')) {
    return '/.netlify/functions';
  }
  
  // Default: assume Railway or same origin
  return '/api';
};

const API_BASE = getApiBase();
```

---

## Common 404 Causes

### 1. API URL Not Set
- **Symptom**: Frontend tries `/api/...` but backend is elsewhere
- **Fix**: Set `VITE_API_URL` environment variable

### 2. Wrong Path
- **Symptom**: Calling `/students` instead of `/api/students`
- **Fix**: API client already handles this correctly

### 3. Backend Not Running
- **Symptom**: All API calls return 404
- **Fix**: Check Railway/Netlify logs, ensure backend is deployed

### 4. CORS Issues
- **Symptom**: 404 or CORS errors
- **Fix**: Ensure CORS is enabled on backend

---

## Debug Steps

1. **Check Browser Console**:
   - Open DevTools (F12)
   - Network tab
   - See which URL is returning 404

2. **Check API Base**:
   ```javascript
   console.log('API_BASE:', API_BASE);
   ```

3. **Test API Endpoint**:
   - Try: `https://your-railway-url.up.railway.app/api/auth`
   - Should return JSON (even if error)

4. **Check Environment Variables**:
   - Railway: Variables tab
   - Netlify: Environment variables

---

## Platform-Specific Fixes

### Railway Only
```typescript
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:3001/api' 
  : 'https://performance-course-manager-production.up.railway.app/api';
```

### Netlify Only
```typescript
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8888/.netlify/functions' 
  : '/.netlify/functions';
```

### Hybrid (Recommended)
```typescript
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:3001/api' 
  : (import.meta.env.VITE_API_URL || '/api');
```

Then set `VITE_API_URL` in your deployment platform.

---

**Fix the API base URL and the 404 errors will be resolved! 🚀**
