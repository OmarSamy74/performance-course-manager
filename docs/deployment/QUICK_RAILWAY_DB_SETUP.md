# ⚡ Quick Railway Primary Database Setup

## 🎯 Railway Storage = Primary Database

Railway's file system is your **PRIMARY DATABASE**. No external services needed!

---

## 🚀 3-Step Setup

### Step 1: Create Volume (2 minutes)

1. Railway Dashboard → Your Service → **Settings** → **Volumes**
2. Click **"New Volume"**
3. Set:
   - **Name**: `data-storage`
   - **Mount Path**: `/data`
4. Click **"Create"**

### Step 2: Set Environment Variables (1 minute)

Railway Dashboard → **Variables** → Add:

```bash
DATA_DIR=/data
AUTO_INIT_DB=true
NODE_ENV=production
```

### Step 3: Initialize Database (Automatic)

The database will auto-initialize on next deployment, or run:

```bash
railway run npm run init-db:seed
```

**Done!** Railway is now your primary database.

---

## ✅ What Gets Created

12 JSON files in `/data`:
- `users.json` - User accounts
- `students.json` - Student records  
- `leads.json` - CRM leads
- `materials.json` - Course materials
- `lessons.json` - Lessons
- `assignments.json` - Assignments
- `submissions.json` - Submissions
- `quizzes.json` - Quizzes
- `attempts.json` - Quiz attempts
- `progress.json` - Progress tracking
- `grades.json` - Grades
- `sessions.json` - Active sessions

---

## 🔍 Verify It's Working

```bash
# Check database location
railway logs | grep "Railway Primary Database"

# List files
railway run ls -la /data

# Test API
curl https://performance-course-manager-production.up.railway.app/api/students
```

---

## 📊 Data Flow

```
User Action → Frontend → API → Railway Storage (/data/*.json) → Response
```

All data operations use Railway storage - it's the PRIMARY database!

---

**That's it! Railway is your primary database! 🗄️🚀**
