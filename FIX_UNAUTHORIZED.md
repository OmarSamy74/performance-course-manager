# 🔧 Fix "Unauthorized" Error

## Problem

Getting error: `{"error":"Unauthorized"}`

This means:
- ✅ API is reachable
- ✅ Request is being made
- ❌ Token is either not being sent OR not being recognized by server

---

## What Was Fixed

### 1. Improved Token Extraction
- **Before**: Only checked `authorization` and `Authorization` headers
- **After**: Checks multiple header name variations (case-insensitive)
- **Result**: More robust token extraction

### 2. Better Error Messages
- **Before**: Generic "Unauthorized"
- **After**: Specific messages:
  - `"No authorization token provided"` - when token is missing
  - `"Invalid or expired session"` - when token is invalid/expired

### 3. Debug Logging
- Server logs show what headers were received
- Client logs show when token is sent
- Helps diagnose token transmission issues

---

## Debugging Steps

### 1. Check Browser Console (Client Side)

After logging in, check console for:
```
✅ Auth token set after login
🔑 Sending token in request: <token-preview>...
```

If you see `⚠️ No auth token available`, the token wasn't set after login.

### 2. Check Network Tab

1. Open DevTools → Network tab
2. Make a request (e.g., GET /api/students)
3. Click on the request
4. Check **Request Headers**:
   - Should see: `Authorization: Bearer <token>`
   - If missing, token isn't being sent

### 3. Check Railway Logs (Server Side)

In Railway Dashboard → Logs, look for:
```
🔍 Auth check failed - no token found
📋 Headers: { authorization: ..., ... }
```

This shows what the server received.

### 4. Verify Token in localStorage

Open Browser Console and run:
```javascript
localStorage.getItem('auth_token')
```

Should return a token string. If `null`, token wasn't saved.

### 5. Test Token Manually

```javascript
// In browser console
const token = localStorage.getItem('auth_token');
fetch('https://performance-course-manager-production.up.railway.app/api/auth', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Should return `{ user: {...} }` if token is valid.

---

## Common Issues

### Issue 1: Token Not Set After Login

**Symptom**: Login succeeds but no token in localStorage

**Check**:
- Browser console for "✅ Auth token set after login"
- Network tab → Login response → Should have `token` field

**Fix**: Ensure login API returns `{ user, token, expiresAt }`

### Issue 2: Token Not Sent in Requests

**Symptom**: Token exists in localStorage but not in request headers

**Check**:
- Network tab → Request headers
- Should see `Authorization: Bearer <token>`

**Fix**: Already fixed - token is now read fresh on each request

### Issue 3: Token Format Issue

**Symptom**: Token sent but server doesn't recognize it

**Check**:
- Token should be: `Bearer <token>` format
- No extra spaces or characters

**Fix**: Code now trims whitespace automatically

### Issue 4: Session Not Found

**Symptom**: Token is valid format but server says "Invalid or expired session"

**Possible Causes**:
- Session expired (7 days)
- Database not initialized (sessions.json doesn't exist)
- Session was deleted

**Fix**:
1. Re-login to create new session
2. Run `npm run init-db` to ensure database is initialized
3. Check Railway logs for session lookup errors

### Issue 5: CORS Blocking Headers

**Symptom**: Request fails before reaching server

**Check**:
- Browser console for CORS errors
- Network tab → Request shows CORS error

**Fix**: CORS is enabled on server, but check Railway CORS settings

---

## Step-by-Step Debugging

### Step 1: Verify Login Works
1. Log in with `admin` / `123`
2. Check console: `✅ Auth token set after login`
3. Check localStorage: `localStorage.getItem('auth_token')` returns token

### Step 2: Verify Token is Sent
1. Make any authenticated request (e.g., get students)
2. Check Network tab → Request headers
3. Should see: `Authorization: Bearer <token>`

### Step 3: Verify Server Receives Token
1. Check Railway logs
2. Look for auth check messages
3. If "no token found", check header name case

### Step 4: Verify Session Exists
1. Check Railway logs for "Invalid or expired session"
2. If seen, session might not exist in database
3. Re-login to create new session

---

## Quick Fixes

### Fix 1: Clear and Re-login
```javascript
// In browser console
localStorage.clear();
location.reload();
// Then log in again
```

### Fix 2: Initialize Database
```bash
# On Railway or locally
npm run init-db:seed
```

### Fix 3: Check Environment Variables
Ensure Railway has:
- `NODE_ENV=production`
- `DATA_DIR=/data` (if using volume)

---

## Testing with curl

### Test Login
```bash
curl -X POST https://performance-course-manager-production.up.railway.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123"}'
```

Save the token from response.

### Test Authenticated Request
```bash
curl -X GET https://performance-course-manager-production.up.railway.app/api/students \
  -H "Authorization: Bearer <token-from-login>"
```

Should return student list if token is valid.

---

## After Fix

The improvements ensure:
- ✅ Token extraction handles all header name variations
- ✅ Better error messages help diagnose issues
- ✅ Debug logging shows what's happening
- ✅ Token is always read fresh from localStorage

---

## Still Not Working?

1. **Check Railway Logs**: Look for auth check messages
2. **Check Browser Console**: Look for token-related messages
3. **Verify Database**: Ensure `sessions.json` exists in `/data`
4. **Test with curl**: Bypass frontend to test API directly
5. **Clear Everything**: Clear localStorage and re-login

---

**The fix is deployed. Check the browser console and Railway logs for debug messages! 🚀**
