# 🔧 Fix 401 Unauthorized Error

## Understanding the Error

A **401 Unauthorized** error means:
- ✅ The API endpoint is reachable (not a 404)
- ❌ Authentication failed - invalid credentials

---

## Valid Login Credentials

### Staff Accounts

| Username | Password | Role |
|----------|----------|------|
| `admin` | `123` | Administrator |
| `teacher` | `123` | Teacher |
| `sales` | `123` | Sales Agent |
| `omar.samy` | `123` | Teacher |
| `abdelatif.reda` | `123` | Teacher |
| `karim.ali` | `123` | Teacher |

### Student Accounts

- **Username**: Phone number (e.g., `01234567890`)
- **Password**: Same phone number

---

## Common Causes

### 1. Wrong Credentials
- **Symptom**: Using incorrect username/password
- **Fix**: Use exact credentials from the table above (case-sensitive)

### 2. Whitespace Issues
- **Symptom**: Extra spaces in username/password
- **Fix**: Code now trims whitespace automatically

### 3. Request Body Not Parsed
- **Symptom**: Server receives empty body
- **Fix**: Ensure `Content-Type: application/json` header is sent

### 4. CORS Issues
- **Symptom**: Request blocked before reaching server
- **Fix**: CORS is enabled, but check browser console for CORS errors

---

## Debugging Steps

### 1. Check Browser Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Click on the `/api/auth` request
5. Check:
   - **Request Payload**: Should show `{"username":"admin","password":"123"}`
   - **Response**: Should show error message

### 2. Check Server Logs
If you have access to Railway logs:
- Look for: `Login attempt: { username: '...', password: '***' }`
- This shows what the server received

### 3. Test with curl
```bash
curl -X POST https://performance-course-manager-production.up.railway.app/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123"}'
```

Should return:
```json
{
  "user": { "id": "admin", "username": "Administrator", "role": "admin" },
  "token": "...",
  "expiresAt": "..."
}
```

---

## Quick Test

Try logging in with:
- **Username**: `admin`
- **Password**: `123`

If this works, the issue is with the specific credentials you're using.

---

## What Was Fixed

1. ✅ Added automatic whitespace trimming
2. ✅ Added debug logging (check Railway logs)
3. ✅ Better error messages

---

## Still Not Working?

1. **Check Railway Logs**:
   - Railway Dashboard → Your Service → Logs
   - Look for login attempts and errors

2. **Verify Request Format**:
   - Open Browser DevTools → Network
   - Check the request payload is correct JSON

3. **Test Direct API Call**:
   - Use curl or Postman to test the API directly
   - Bypasses frontend issues

---

**Try logging in with `admin` / `123` first to verify the API is working! 🚀**
