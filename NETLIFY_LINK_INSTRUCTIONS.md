# 🔗 Netlify Link Instructions

## Current Status

✅ **Logged in to Netlify** (Email: s-omar.samy@zewailcity.edu.eg)  
✅ **Build works** (tested successfully)  
❌ **Project not linked** (needs manual linking)

---

## Step 1: Link Project (Interactive)

Run this command in your terminal:

```bash
netlify link
```

You'll see a menu. Choose one of these options:

### Option A: Use Current Git Remote (Recommended)
- Select: **"Use current git remote origin"**
- This will link to your GitHub repo: `https://github.com/OmarSamy74/performance-course-manager`
- Netlify will find your existing site or create a new one

### Option B: Search by Project Name
- Select: **"Search by full or partial project name"**
- Type: `performance-course-manager`
- Select your site from the list

### Option C: Choose from Recent Projects
- Select: **"Choose from a list of your recently updated projects"**
- Pick your site from the list

---

## Step 2: After Linking

Once linked, run these commands:

```bash
# Set environment variables
netlify env:set NODE_ENV production
netlify env:set VITE_API_URL "https://performance-course-manager-production.up.railway.app/api"
netlify env:set NODE_VERSION 18
netlify env:set NPM_CONFIG_PRODUCTION false

# Verify variables
netlify env:list

# Deploy
netlify deploy --prod

# View logs
netlify logs:watch
```

---

## Quick Setup After Linking

Or just run the setup script:

```bash
./setup-netlify.sh
```

---

## Verify Link

After linking, verify:

```bash
netlify status
```

Should show:
- ✅ Site linked
- ✅ Site URL
- ✅ Team information

---

**Run `netlify link` in your terminal and follow the prompts! 🚀**
