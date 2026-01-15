# 🚂 Railway Deployment - Simplified (No Firebase)

## ✅ Firebase Removed!

Your app now uses **file-based JSON storage** - no external services needed!

---

## Quick Setup (3 Steps)

### 1. Environment Variables

In Railway → **Variables** tab, add only:

```
NODE_ENV=production
PORT=3001
VITE_API_URL=https://performance-course-manager-production.up.railway.app
```

**That's it!** No Firebase configuration needed.

### 2. Deploy

Railway auto-deploys when you:
- Connect GitHub repository
- Push code changes

### 3. Test

Visit: `https://performance-course-manager-production.up.railway.app`

Login with:
- **Omar Samy**: `omar.samy` / `123`
- **Abdelatif Reda**: `abdelatif.reda` / `123`
- **Karim Ali**: `karim.ali` / `123`

---

## How Storage Works

- Data stored in `/data` directory as JSON files
- Railway's file system is persistent
- No API keys or external services
- Simple and reliable

---

## Optional: Persistent Volume

For guaranteed data persistence:

1. Railway Dashboard → **Settings** → **Volumes**
2. Click **"New Volume"**
3. Name: `data-storage`
4. Mount Path: `/data`
5. Done!

---

## Benefits

✅ No Firebase account needed  
✅ No API keys to manage  
✅ Faster (direct file access)  
✅ Simpler setup  
✅ Lower costs  

---

**Your app is now 100% Railway-native! 🚀**
