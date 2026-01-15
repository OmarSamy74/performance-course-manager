# 🚀 Railway Database Auto-Setup

## Quick Setup Script

Automate the 3-step Railway database setup with one command!

---

## 🎯 Automated Setup

### Option 1: Using NPM Script (Recommended)

```bash
npm run setup:railway-db
```

### Option 2: Using Shell Script

```bash
./setup-railway-database.sh
```

### Option 3: Using Node Script

```bash
node setup-railway-database.js
```

---

## 📋 What the Script Does

### Step 1: Create Railway Volume
- ⚠️ **Manual Step Required**: Railway CLI doesn't support volume creation yet
- Script will prompt you to create volume via Railway Dashboard
- Instructions provided in the script output

### Step 2: Set Environment Variables
Automatically sets:
- `DATA_DIR=/data`
- `AUTO_INIT_DB=true`
- `NODE_ENV=production`

### Step 3: Initialize Database
- Runs `npm run init-db:seed`
- Creates all 12 collection files
- Seeds initial user accounts

---

## 🗄️ Database Structure

After setup, these 12 JSON files are created in `/data`:

```
/data/
├── users.json          # User accounts (admin, teachers, students)
├── sessions.json       # Active user sessions
├── students.json       # Student records
├── leads.json          # CRM leads
├── materials.json      # Course materials/lectures
├── lessons.json        # Interactive lessons
├── assignments.json    # Assignments
├── submissions.json    # Assignment submissions
├── quizzes.json        # Quizzes
├── attempts.json       # Quiz attempts
├── progress.json       # Student progress tracking
└── grades.json         # Student grades
```

---

## ✅ Prerequisites

1. **Railway CLI installed**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Logged in to Railway**:
   ```bash
   railway login
   ```

3. **Project linked**:
   ```bash
   railway link
   ```

---

## 🔧 Manual Setup (If Script Doesn't Work)

### Step 1: Create Volume

1. Railway Dashboard → Your Service → **Settings** → **Volumes**
2. Click **"New Volume"**
3. Configure:
   - **Name**: `data-storage`
   - **Mount Path**: `/data`
4. Click **"Create"**

### Step 2: Set Environment Variables

```bash
railway variables set DATA_DIR=/data
railway variables set AUTO_INIT_DB=true
railway variables set NODE_ENV=production
```

### Step 3: Initialize Database

```bash
railway run npm run init-db:seed
```

---

## 🔍 Verify Setup

### Check Environment Variables

```bash
railway variables
```

Should show:
- `DATA_DIR=/data`
- `AUTO_INIT_DB=true`
- `NODE_ENV=production`

### Check Database Files

```bash
railway run ls -la /data
```

Should show all 12 JSON files.

### Test API

```bash
curl https://performance-course-manager-production.up.railway.app/api/students
```

Should return student data (or empty array).

---

## 📊 Data Flow

```
User Action → Frontend → API → Railway Storage (/data/*.json) → Response
```

All data operations use Railway storage as the **PRIMARY DATABASE**.

---

## 🚨 Important Notes

1. **Volume Creation**: Must be done via Railway Dashboard (CLI limitation)
2. **Auto-Init**: Database auto-initializes in production with `AUTO_INIT_DB=true`
3. **Persistence**: Data persists across deployments with Railway volume
4. **Backup**: Railway volumes can be backed up via dashboard

---

## 🛠️ Troubleshooting

### Script Fails

Run steps manually using the commands in "Manual Setup" section.

### Volume Not Found

Ensure volume is created in Railway Dashboard and mounted at `/data`.

### Database Not Initialized

```bash
railway run npm run init-db:seed
```

### Check Logs

```bash
railway logs | grep "Railway Primary Database"
```

Should show: `🗄️ Railway Primary Database: /data`

---

**Run `npm run setup:railway-db` to automate the setup! 🚀**
