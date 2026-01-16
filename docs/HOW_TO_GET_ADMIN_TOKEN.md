# 🔑 How to Get Admin Token

## 📋 Step-by-Step Guide

### Method 1: From Browser DevTools (Easiest)

1. **Open your website**:
   - Go to: https://performance-course-manager-production.up.railway.app
   - Login as **admin** user

2. **Open Browser DevTools**:
   - Press `F12` or `Right-click → Inspect`
   - Or: `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

3. **Go to Network Tab**:
   - Click on **"Network"** tab in DevTools

4. **Make any action** (refresh page, click something)

5. **Find API Request**:
   - Look for requests to `/api/` (like `/api/dashboard`, `/api/students`, etc.)
   - Click on any API request

6. **Get Token from Headers**:
   - In the request details, go to **"Headers"** section
   - Scroll down to **"Request Headers"**
   - Find: `Authorization: Bearer YOUR_TOKEN_HERE`
   - Copy the token (the part after `Bearer `)

### Method 2: From Application Tab (Cookies/Storage)

1. **Open DevTools** (F12)

2. **Go to Application Tab**:
   - Click **"Application"** tab
   - (Or "Storage" in Firefox)

3. **Check Cookies**:
   - Expand **"Cookies"** in left sidebar
   - Click on your domain
   - Look for cookie named `authToken` or similar
   - Copy the value

4. **Or Check Local Storage**:
   - Expand **"Local Storage"** in left sidebar
   - Click on your domain
   - Look for `authToken` or `token`
   - Copy the value

### Method 3: From Console (JavaScript)

1. **Open DevTools** (F12)

2. **Go to Console Tab**

3. **Run this command**:
   ```javascript
   // Check if token is in memory (if your app stores it)
   console.log(localStorage.getItem('authToken'));
   // Or
   console.log(sessionStorage.getItem('authToken'));
   ```

## 🎯 Quick Example

After logging in as admin, your token might look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTYzODQ2NzIwMCwiZXhwIjoxNjM4NTUzNjAwfQ.xxxxx
```

## ⚠️ Important

- Token expires after some time (usually 24 hours)
- You need to be **logged in as ADMIN**
- Token is different for each login session

## 🔄 If Token Doesn't Work

1. **Logout and login again** to get a fresh token
2. **Make sure you're logged in as ADMIN** (not teacher/student)
3. **Check token hasn't expired**

## 📝 Using the Token

Once you have the token, run:

```bash
npm run get-passwords:api
```

Then paste the token when prompted.
