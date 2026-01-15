# 🗄️ PostgreSQL Database Setup on Railway

## Overview

This application now supports **PostgreSQL** as the primary database. When `DATABASE_URL` is set (Railway automatically provides this), the app uses PostgreSQL. Otherwise, it falls back to file-based JSON storage.

---

## 🚀 Quick Setup on Railway

### Step 1: Add PostgreSQL Service

1. **Railway Dashboard** → Your Project
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically:
   - Create a PostgreSQL database
   - Set `DATABASE_URL` environment variable
   - Provide connection credentials

### Step 2: Deploy Your Application

The application will automatically:
- Detect `DATABASE_URL`
- Initialize the database schema
- Create all necessary tables

### Step 3: Seed Initial Data (Optional)

```bash
# Via Railway CLI
railway run npm run init-db:pg

# Or set environment variable for auto-seeding
SEED_DB=true
```

---

## 📊 Database Schema

The PostgreSQL database includes these tables:

- **users** - User accounts (admin, teachers, sales, students)
- **sessions** - Active user sessions
- **students** - Student records
- **installments** - Student payment installments
- **leads** - CRM leads
- **materials** - Course materials
- **lessons** - Course lessons
- **assignments** - Assignments
- **submissions** - Assignment submissions
- **quizzes** - Quizzes
- **quiz_attempts** - Quiz attempts
- **progress** - Student progress tracking
- **grades** - Student grades

---

## 🔧 Environment Variables

Railway automatically sets:
- `DATABASE_URL` - PostgreSQL connection string

Optional:
- `SEED_DB=true` - Auto-seed initial users on startup
- `AUTO_INIT_DB=true` - Auto-initialize schema on startup

---

## ✅ Verify It's Working

1. **Check Logs**:
   ```bash
   railway logs | grep "PostgreSQL"
   ```
   Should see: `✅ PostgreSQL connected` and `✅ Database schema initialized`

2. **Test API**:
   ```bash
   curl https://your-app.railway.app/api/auth
   ```

3. **Check Database**:
   ```bash
   railway run psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
   ```

---

## 🔄 Migration from File Storage

If you have existing data in file-based storage:

1. **Export data** from JSON files
2. **Import to PostgreSQL** using migration script (coming soon)
3. **Set `DATABASE_URL`** to switch to PostgreSQL

---

## 📝 Notes

- **Automatic Detection**: App automatically uses PostgreSQL if `DATABASE_URL` is set
- **Fallback**: If PostgreSQL is unavailable, falls back to file-based storage
- **No Code Changes**: All routes work the same way - storage layer handles the difference
- **Performance**: PostgreSQL is faster and more reliable for production use

---

**That's it! Your app is now using PostgreSQL on Railway! 🚀**
