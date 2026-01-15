# 🚂 Railway Deployment - Quick Checklist

## Your URL: `performance-course-manager-production.up.railway.app`

---

## ✅ Step-by-Step Checklist

### 1️⃣ Create Account
- [ ] Go to https://railway.app
- [ ] Click "Start a New Project"
- [ ] Sign up with GitHub (recommended)
- [ ] Authorize Railway access

### 2️⃣ Create Project
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Find and select `performance-course-manager`
- [ ] Railway auto-detects Node.js

### 3️⃣ Set Environment Variables
Go to: **Project → Service → Variables Tab**

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001`
- [ ] `VITE_API_URL` = `https://performance-course-manager-production.up.railway.app`

### 4️⃣ Verify Build Settings
Go to: **Settings → Build & Deploy**

- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm start`
- [ ] Root Directory: `/`

### 5️⃣ Deploy
- [ ] Railway auto-starts building
- [ ] Wait for "Build successful"
- [ ] Check deployment logs (no errors)

### 6️⃣ Get URL
Go to: **Settings → Domains**

- [ ] Copy your URL: `performance-course-manager-production.up.railway.app`
- [ ] (Optional) Add custom domain

### 7️⃣ Test
- [ ] Visit: https://performance-course-manager-production.up.railway.app
- [ ] See login page with soccer theme
- [ ] Test student login (phone number)
- [ ] Test staff login (omar.samy / 123)

### 8️⃣ Verify
- [ ] Login works
- [ ] Dashboard loads
- [ ] Data storage works
- [ ] All features functional

---

## 🔧 Quick Fixes

### Build Fails?
1. Check Variables tab (all set?)
2. Check Build logs for errors
3. Verify package.json has all deps

### Can't Login?
1. Verify VITE_API_URL is correct
2. Check server logs in Railway
3. Verify data directory permissions

### Website Not Loading?
1. Check deployment status
2. Verify service is running
3. Check domain settings

---

## 📍 Railway Dashboard Locations

**Variables**: Project → Service → Variables Tab  
**Logs**: Project → Deployments → Click deployment → View Logs  
**Settings**: Project → Settings Tab  
**Metrics**: Project → Metrics Tab  

---

## 🎯 Your Configuration

```
URL: https://performance-course-manager-production.up.railway.app
Build: npm run build
Start: npm start
Port: 3001
```

---

**Done! Your app is live! ⚽**
