# 🚀 Quick Deploy to Netlify

## 5-Minute Setup

### Step 1: Sign Up
1. Go to **https://www.netlify.com**
2. Sign up with GitHub

### Step 2: Deploy
1. Click **"Add new site"** → **"Import from GitHub"**
2. Select **`performance-course-manager`** repository
3. Netlify auto-detects settings
4. Click **"Deploy site"**

### Step 3: Add Environment Variables
1. **Site settings** → **Environment variables**
2. Add: `NODE_ENV=production`
3. Click **"Redeploy"**

### Step 4: Done!
Your site is live at: `https://your-site.netlify.app`

---

## Build Settings (Auto-detected)

✅ Build command: `npm run build`  
✅ Publish: `dist`  
✅ Functions: `netlify/functions`  

---

## Test Your Site

Visit your Netlify URL and login:
- **Omar Samy**: `omar.samy` / `123`
- **Student**: Use phone number

---

## Architecture Options

**Option 1: Full Netlify**
- Frontend + Functions on Netlify
- Use Netlify Functions for API

**Option 2: Hybrid** ⭐ Recommended
- Frontend on Netlify
- Backend on Railway
- Set `VITE_API_URL` to Railway URL

---

**That's it! Your app is on Netlify! 🎉**
