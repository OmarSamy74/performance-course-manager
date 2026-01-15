# 🗄️ Railway Primary Database Configuration

## Overview

**Railway Storage is the PRIMARY database** for this application. All data is stored in Railway's persistent file system using JSON files.

---

## ✅ Current Configuration

### Database Location
- **Production (Railway)**: `/data` directory (or `$DATA_DIR` if set)
- **With Volume**: Mounted at `/data` for guaranteed persistence
- **Without Volume**: Uses Railway's persistent file system

### Storage System
- **Type**: File-based JSON storage
- **Location**: Railway file system (`/data` directory)
- **Persistence**: ✅ Data survives deployments and restarts
- **Backup**: Railway volumes can be backed up

---

## 🚀 Setup Railway as Primary Database

### Step 1: Create Railway Volume (Recommended)

1. **Railway Dashboard** → Your Service → **Settings** → **Volumes**
2. Click **"New Volume"**
3. Configure:
   - **Name**: `data-storage`
   - **Mount Path**: `/data`
   - **Size**: 1GB (or as needed)
4. Click **"Create"**

### Step 2: Set Environment Variables

In Railway → **Variables** tab, set:

```bash
# Primary Database Configuration
DATA_DIR=/data
AUTO_INIT_DB=true
NODE_ENV=production
PORT=3001
```

### Step 3: Initialize Database

The database will auto-initialize on first deployment, or run manually:

```bash
railway run npm run init-db:seed
```

---

## 📊 Database Structure

All data is stored in JSON files in `/data`:

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

## 🔧 How It Works

### Data Flow

```
Frontend → API Request → Express Server → Railway Storage (/data/*.json) → Response
```

### Storage Operations

1. **Read**: `readData('collection')` → Reads JSON file
2. **Write**: `writeData('collection', data)` → Writes JSON file
3. **Create**: `createById('collection', item)` → Adds to JSON array
4. **Update**: `updateById('collection', id, updates)` → Updates item in JSON
5. **Delete**: `deleteById('collection', id)` → Removes from JSON array

### Automatic Initialization

When `AUTO_INIT_DB=true`:
- Server checks if database exists on startup
- If not found, automatically initializes all collections
- Seeds initial user accounts (admin, teachers)

---

## ✅ Benefits of Railway Primary Database

1. **No External Services**: No Firebase, MongoDB, or PostgreSQL needed
2. **Simple Setup**: Just configure volume and environment variables
3. **Persistent**: Data survives deployments and restarts
4. **Fast**: Direct file access, no network latency
5. **Cost Effective**: Included with Railway service
6. **Easy Backup**: Just backup `/data` directory
7. **No API Keys**: No credentials to manage
8. **Reliable**: Railway's file system is production-ready

---

## 🔒 Data Persistence

### With Volume (Recommended)
- ✅ **Guaranteed persistence** across deployments
- ✅ **Survives service recreations**
- ✅ **Can be backed up** via Railway CLI or dashboard
- ✅ **Scalable** - can increase volume size

### Without Volume
- ✅ **Persists** between deployments
- ⚠️ **May be lost** if service is recreated
- ✅ **Works** for most use cases

---

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATA_DIR` | Database directory path | No | `/data` or `./data` |
| `AUTO_INIT_DB` | Auto-initialize on startup | No | `false` |
| `RAILWAY_VOLUME_MOUNT_PATH` | Volume mount path (auto-set) | No | - |
| `NODE_ENV` | Environment | Yes | `production` |

---

## 🛠️ Management Commands

### Initialize Database

```bash
# Via Railway CLI
railway run npm run init-db:seed

# Or locally
npm run init-db:seed
```

### Check Database Status

```bash
# List files
railway run ls -la /data

# View users
railway run cat /data/users.json

# Check size
railway run du -sh /data
```

### Backup Database

```bash
# Create backup
railway run tar -czf /tmp/db-backup.tar.gz /data

# Or use Railway volume backup feature
```

---

## 🔍 Verification

### Check Database is Working

1. **Check Logs**:
   ```bash
   railway logs
   ```
   Should see: `🗄️ Railway Primary Database: /data`

2. **Test API**:
   ```bash
   curl https://performance-course-manager-production.up.railway.app/api/students
   ```
   Should return student data (or empty array)

3. **Check Files**:
   ```bash
   railway run ls -la /data
   ```
   Should show all JSON collection files

---

## 📈 Scaling Considerations

### Current Capacity
- **Small to Medium**: Up to 10,000 records per collection
- **File Size**: Each JSON file can be up to 10MB
- **Total Storage**: 1GB volume recommended

### When to Upgrade
- If collections exceed 10,000 items
- If JSON files exceed 10MB
- If you need better query performance

### Migration Path
If you outgrow JSON storage:
1. Keep Railway as primary
2. Add PostgreSQL/MySQL as secondary
3. Migrate data gradually
4. Update storage utilities

---

## 🚨 Important Notes

1. **Railway is PRIMARY**: All data operations use Railway storage
2. **No Fallback**: No localStorage or other storage methods
3. **API-Only**: Frontend only communicates via API
4. **Auto-Init**: Database initializes automatically in production
5. **Volume Recommended**: Use Railway volume for production

---

## 📚 Related Documentation

- `DATABASE_INIT.md` - Database initialization guide
- `RAILWAY_SETUP.md` - Railway deployment setup
- `NO_FIREBASE_SETUP.md` - Firebase removal details

---

**Railway Storage is now your PRIMARY database! 🗄️🚀**
