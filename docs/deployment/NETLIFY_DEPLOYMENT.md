# 🚀 Deploy to Netlify - Step by Step Guide

## Overview

This guide shows you how to deploy your `performance-course-manager` app to Netlify instead of (or in addition to) Railway.

---

## Step 1: Create Netlify Account

1. Go to **https://www.netlify.com**
2. Click **"Sign up"** button (top right)
3. Choose sign-up method:
   - **GitHub** (Recommended - easiest for deployment)
   - **Email**
   - **GitLab**
   - **Bitbucket**

4. If using GitHub:
   - Click **"Continue with GitHub"**
   - Authorize Netlify to access your repositories
   - You'll be redirected to Netlify dashboard

---

## Step 2: Prepare Your Project for Netlify

### 2.1 Update Build Configuration

Your project already has `netlify.toml`, but let's verify it's correct:

**Check `netlify.toml` exists and has:**
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2.2 Update for Express Server

Since you have an Express server, you have two options:

**Option A: Use Netlify Functions (Recommended)**
- Your functions are already in `netlify/functions/`
- Netlify will handle them automatically

**Option B: Use Netlify Edge Functions**
- For serverless functions
- Better performance

**Option C: Deploy Express Server Separately**
- Keep Express on Railway
- Deploy only frontend to Netlify
- Point frontend to Railway API

---

## Step 3: Deploy from GitHub

### 3.1 Connect Repository

1. In Netlify dashboard, click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Authorize Netlify (if not already done)
4. Select your repository: **`performance-course-manager`**
5. Click **"Next"**

### 3.2 Configure Build Settings

Netlify should auto-detect settings, but verify:

**Build settings:**
- **Base directory**: (leave empty)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

Click **"Deploy site"**

### 3.3 Alternative: Manual Configuration

If auto-detect doesn't work:

1. Click **"Show advanced"**
2. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
3. Click **"Deploy site"**

---

## Step 4: Configure Environment Variables

### 4.1 Access Environment Variables

1. After deployment starts, go to **"Site configuration"**
2. Click **"Environment variables"**
3. Or: **Site settings** → **Build & deploy** → **Environment**

### 4.2 Add Required Variables

Click **"Add a variable"** for each:

**Required Variables:**

1. **NODE_ENV**
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - **Scope**: All scopes

2. **API URL** (if using separate backend)
   - **Key**: `VITE_API_URL`
   - **Value**: Your Railway URL or Netlify functions URL
   - **Scope**: All scopes

3. **For Netlify Functions** (if using them):
   - Add any variables your functions need
   - No Firebase needed (you removed it!)

### 4.3 Redeploy After Adding Variables

1. Go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. This rebuilds with new environment variables

---

## Step 5: Configure Netlify Functions

### 5.1 Verify Functions Directory

Your functions are in `netlify/functions/`:
- ✅ `auth.ts`
- ✅ `students.ts`
- ✅ `leads.ts`
- ✅ etc.

### 5.2 Update Function Imports

Make sure your functions use correct imports:

```typescript
// netlify/functions/auth.ts
import { Handler } from '@netlify/functions';
// ... rest of your code
```

### 5.3 Test Functions

After deployment, test your functions:
- `https://your-site.netlify.app/.netlify/functions/auth`
- `https://your-site.netlify.app/.netlify/functions/students`

---

## Step 6: Update API Client for Netlify

### 6.1 Update API Base URL

In `src/api/client.ts`, make sure it works with Netlify:

```typescript
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8888/.netlify/functions' 
  : '/.netlify/functions';
```

This should already be correct if you had Netlify setup before.

### 6.2 Verify Environment Variables

For production, set:
- `VITE_API_URL` = Your Netlify site URL (optional, defaults to `/.netlify/functions`)

---

## Step 7: Get Your Netlify URL

### 7.1 Default Domain

1. After deployment completes
2. Netlify provides a default domain:
   - Format: `random-name-12345.netlify.app`
   - Or: `performance-course-manager.netlify.app` (if available)

3. Your site is live at this URL!

### 7.2 Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow DNS setup instructions
5. Netlify will provide DNS records to add

---

## Step 8: Verify Deployment

### 8.1 Check Build Logs

1. Go to **"Deploys"** tab
2. Click on the latest deployment
3. Check build logs for errors
4. Should see: "Build successful" ✅

### 8.2 Test Your Site

1. Visit your Netlify URL
2. Test login:
   - Student: Phone number
   - Staff: `omar.samy` / `123`
3. Verify all features work

### 8.3 Test Functions

Test API endpoints:
- `https://your-site.netlify.app/.netlify/functions/auth`
- `https://your-site.netlify.app/.netlify/functions/students`

---

## Step 9: Continuous Deployment

### 9.1 Automatic Deploys

Netlify automatically deploys when you:
- Push to your main/master branch
- Merge pull requests
- Push to connected branch

### 9.2 Branch Deploys

- **Production**: Main/master branch
- **Preview**: Other branches get preview URLs
- **Deploy previews**: Every PR gets a unique URL

---

## Step 10: Configure Redirects and Headers

### 10.1 SPA Routing

Your `netlify.toml` already has:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This handles React Router routing.

### 10.2 Security Headers

Add to `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## Architecture Options

### Option 1: Full Netlify Deployment (Recommended)

**Frontend + Functions on Netlify:**
- ✅ Frontend: Netlify CDN
- ✅ Backend: Netlify Functions
- ✅ All in one place
- ✅ Easy to manage

**Setup:**
- Deploy everything to Netlify
- Use Netlify Functions for API
- No external services needed

### Option 2: Hybrid (Frontend on Netlify, Backend on Railway)

**Frontend on Netlify, API on Railway:**
- ✅ Frontend: Netlify (fast CDN)
- ✅ Backend: Railway (Express server)
- ✅ Best of both worlds

**Setup:**
1. Deploy frontend to Netlify
2. Keep Express server on Railway
3. Set `VITE_API_URL` to Railway URL

### Option 3: Express Server on Netlify (Advanced)

**Use Netlify's serverless functions as Express:**
- More complex setup
- Requires adapter
- Not recommended for this project

---

## Environment Variables Reference

### Required for Netlify

```
NODE_ENV=production
```

### Optional

```
VITE_API_URL=https://your-railway-url.up.railway.app
```

(Only if using Railway backend)

---

## Build Settings Summary

**Build command**: `npm run build`  
**Publish directory**: `dist`  
**Functions directory**: `netlify/functions`  
**Node version**: 18 (set in netlify.toml)  

---

## Troubleshooting

### Build Fails

1. **Check Build Logs**
   - Go to Deploys → Click deployment → View logs
   - Look for error messages

2. **Common Issues**:
   - Missing dependencies in `package.json`
   - Build command incorrect
   - Node version mismatch

3. **Fix**:
   - Update `package.json`
   - Verify build command
   - Check `netlify.toml` Node version

### Functions Not Working

1. **Check Function Logs**
   - Go to Functions tab
   - Click on function name
   - View logs

2. **Common Issues**:
   - Import errors
   - Missing environment variables
   - Timeout errors

3. **Fix**:
   - Verify function code
   - Add required environment variables
   - Check function timeout settings

### API Not Connecting

1. **Check API Base URL**
   - Verify `src/api/client.ts` has correct URL
   - Check environment variables

2. **Test Functions Directly**
   - Visit function URL in browser
   - Check for CORS errors

3. **Fix**:
   - Update API base URL
   - Add CORS headers to functions

---

## Netlify vs Railway Comparison

| Feature | Netlify | Railway |
|---------|---------|---------|
| **Frontend Hosting** | ✅ Excellent CDN | ✅ Good |
| **Serverless Functions** | ✅ Built-in | ❌ No |
| **Express Server** | ⚠️ Via Functions | ✅ Native |
| **Database** | ❌ External needed | ✅ Built-in PostgreSQL |
| **Free Tier** | ✅ Generous | ✅ Generous |
| **Ease of Setup** | ✅ Very Easy | ✅ Easy |
| **Best For** | Frontend + Functions | Full-stack apps |

---

## Recommended Setup

### For Your Project

**Option A: Full Netlify** (If you want everything on Netlify)
- Deploy frontend to Netlify
- Use Netlify Functions for API
- Use external database (Supabase)

**Option B: Hybrid** (Recommended)
- Frontend on Netlify (fast CDN)
- Backend on Railway (Express server)
- Database on Railway (PostgreSQL)

**Option C: Keep Railway Only**
- Everything on Railway
- Simpler setup
- One platform to manage

---

## Quick Deployment Checklist

- [ ] Netlify account created
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Functions directory verified
- [ ] Build successful
- [ ] Site accessible
- [ ] Functions working
- [ ] Login tested
- [ ] All features working

---

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure SSL** (automatic with Netlify)
3. **Set up form handling** (if needed)
4. **Configure redirects** (already done)
5. **Monitor performance** (Netlify Analytics)

---

## Netlify Dashboard Overview

### Main Sections

1. **Overview**: Site stats and quick actions
2. **Deploys**: Deployment history and logs
3. **Functions**: Serverless function management
4. **Domain management**: Custom domains
5. **Site settings**: Configuration
6. **Analytics**: Performance metrics (paid)

---

**Your app is now deployed on Netlify! 🚀**

Visit your Netlify URL and test it out!
