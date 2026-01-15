# 🔧 Fix Netlify Environment Variable

## Issue Found

Your `VITE_API_URL` in Netlify is set to:
```
performance-course-manager-production.up.railway.app
```

But it should be:
```
https://performance-course-manager-production.up.railway.app/api
```

---

## Quick Fix

### Option 1: Update in Netlify Dashboard (Recommended)

1. Go to **Netlify Dashboard** → Your Site → **Environment variables**
2. Find `VITE_API_URL`
3. Click **Edit** (pencil icon)
4. Change the value to:
   ```
   https://performance-course-manager-production.up.railway.app/api
   ```
5. Click **Save**
6. **Redeploy** your site (or wait for auto-deploy on next push)

### Option 2: Use Netlify CLI

```bash
netlify env:set VITE_API_URL "https://performance-course-manager-production.up.railway.app/api" --context production
```

---

## Why This Matters

- **Missing `https://`**: Without the protocol, the browser doesn't know how to make the request
- **Missing `/api`**: The API client expects the full path to the API endpoints
- **Current value**: `performance-course-manager-production.up.railway.app`
- **Should be**: `https://performance-course-manager-production.up.railway.app/api`

---

## After Fixing

1. The API client code has been updated to handle URLs without protocols (it will add `https://` automatically)
2. But it's still best practice to include the full URL with protocol
3. After updating, your 404 errors should be resolved!

---

## Verify It Works

After updating and redeploying:

1. Open your Netlify site
2. Open Browser DevTools (F12)
3. Go to **Network** tab
4. Try logging in or making an API call
5. Check the request URL - it should be:
   ```
   https://performance-course-manager-production.up.railway.app/api/auth
   ```
6. Should return 200 (or proper error), not 404

---

**Update the environment variable and the 404 errors will be fixed! 🚀**
