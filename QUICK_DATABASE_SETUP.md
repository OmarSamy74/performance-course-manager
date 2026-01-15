# 🗄️ Quick Database Setup - Railway

## You Already Have PostgreSQL! ✅

I can see from your Railway dashboard that you already have:
- ✅ PostgreSQL database deployed
- ✅ Volume attached (`postgres-volume`)
- ✅ Database is Online

---

## Connect Database to Your App (3 Steps)

### Step 1: Get Database URL

1. Click on **PostgreSQL** service in Architecture view
2. Go to **"Variables"** tab
3. Find **`DATABASE_URL`**
4. Click **👁️ eye icon** to reveal
5. Click **"Copy"** button

### Step 2: Add to Your App

1. Click on **`performance-course-manager`** service (your app)
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. **Name**: `DATABASE_URL`
5. **Value**: Paste the copied connection string
6. Click **"Add"**

### Step 3: Update Code (Optional)

If you want to use PostgreSQL instead of JSON files:

1. Install PostgreSQL client:
   ```bash
   npm install pg @types/pg
   ```

2. Update `server/utils/storage.ts` to use PostgreSQL

---

## Current Status

✅ Database: **Online**  
✅ App: **Online**  
⏳ Connection: **Add DATABASE_URL to app variables**

---

## Keep File Storage or Use Database?

**File Storage (Current)**
- ✅ Already working
- ✅ Simple
- ✅ No changes needed

**PostgreSQL (Optional)**
- ✅ Better for large data
- ✅ More features
- ⚠️ Requires code changes

**You can keep using file storage - it works great!**

---

**That's it! Your database is ready when you need it! 🚀**
