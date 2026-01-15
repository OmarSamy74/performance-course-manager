# 🗄️ Initialize Database on Railway

## Problem: "You have no tables"

The database files haven't been initialized on Railway yet. The system uses JSON files (not SQL tables), but they need to be created first.

---

## Quick Fix: Initialize Database on Railway

### Option 1: Using Railway CLI (Recommended)

```bash
# Make sure you're logged in
railway login

# Link to your project (if not already)
railway link

# Initialize database with seed data
railway run npm run init-db:seed
```

### Option 2: Enable Auto-Initialization

Set environment variable to auto-initialize on server start:

```bash
railway variables set AUTO_INIT_DB=true
```

Then restart the service (Railway will auto-restart on next deploy).

### Option 3: Manual Initialization via Railway Dashboard

1. Go to Railway Dashboard → Your Service
2. Click on **"Deployments"** tab
3. Click **"New Deployment"** → **"Deploy from GitHub"**
4. Or use the **"Shell"** option to run:
   ```bash
   npm run init-db:seed
   ```

---

## What Gets Created

The initialization creates these JSON files:

1. `users.json` - User accounts (seeded with admin, teachers)
2. `sessions.json` - Active sessions
3. `students.json` - Student records (empty)
4. `leads.json` - CRM leads (empty)
5. `materials.json` - Course materials (empty)
6. `lessons.json` - Lessons (empty)
7. `assignments.json` - Assignments (empty)
8. `submissions.json` - Assignment submissions (empty)
9. `quizzes.json` - Quizzes (empty)
10. `attempts.json` - Quiz attempts (empty)
11. `progress.json` - Student progress (empty)
12. `grades.json` - Grades (empty)

---

## Verify Database is Initialized

### Check Railway Logs

```bash
railway logs
```

Look for:
```
📦 Database not found, initializing...
✅ Database initialized successfully
```

Or:
```
🚀 Initializing database...
✅ Created users.json
✅ Created students.json
...
```

### Test Login

Try logging in with:
- Username: `admin`
- Password: `123`

If login works, database is initialized!

---

## Troubleshooting

### Database Still Empty After Init

1. **Check DATA_DIR**:
   ```bash
   railway variables get DATA_DIR
   ```
   Should be `/data` or `/app/data`

2. **Check Volume Mount** (if using volume):
   - Railway Dashboard → Settings → Volumes
   - Ensure volume is mounted at `/data`

3. **Re-initialize**:
   ```bash
   railway run npm run init-db:seed
   ```

### Permission Errors

If you see permission errors:
```bash
railway run chmod 755 /data
railway run chmod 644 /data/*.json
```

---

## Quick Commands

```bash
# Initialize database
railway run npm run init-db:seed

# Check if files exist
railway run ls -la /data

# View users file
railway run cat /data/users.json

# Enable auto-init
railway variables set AUTO_INIT_DB=true
```

---

**Run `railway run npm run init-db:seed` to initialize your database! 🚀**
