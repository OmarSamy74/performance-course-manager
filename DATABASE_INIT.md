# 🗄️ Database Initialization Guide

## Quick Start

```bash
# Initialize empty database
npm run init-db

# Initialize database with seed data (recommended for first setup)
npm run init-db:seed
```

---

## What Gets Created

The initialization script creates:

### 📁 Data Directory
- Location: `./data` (or `$DATA_DIR` if set)
- Contains all JSON database files

### 📄 Collection Files

All collections are initialized as empty JSON arrays:

1. **`users.json`** - User accounts (admin, teachers, sales)
2. **`sessions.json`** - Active user sessions
3. **`students.json`** - Student records
4. **`leads.json`** - CRM leads
5. **`materials.json`** - Course materials
6. **`lessons.json`** - Course lessons
7. **`assignments.json`** - Assignments
8. **`submissions.json`** - Assignment submissions
9. **`quizzes.json`** - Quizzes
10. **`attempts.json`** - Quiz attempts
11. **`progress.json`** - Student progress tracking
12. **`grades.json`** - Student grades

### 🌱 Seed Data (with `--seed` flag)

When using `npm run init-db:seed`, the following users are created:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `123` | Administrator |
| `teacher` | `123` | Teacher |
| `sales` | `123` | Sales Agent |
| `omar.samy` | `123` | Teacher |
| `abdelatif.reda` | `123` | Teacher |
| `karim.ali` | `123` | Teacher |

---

## Usage Scenarios

### 🆕 First Time Setup

```bash
# Initialize with seed data
npm run init-db:seed
```

This creates all collections and seeds the initial user accounts.

### 🔄 After Deployment

```bash
# Just ensure collections exist (won't overwrite existing data)
npm run init-db
```

Safe to run multiple times - won't overwrite existing files.

### 🔧 Reset Database

```bash
# Delete data directory
rm -rf data

# Reinitialize with seed data
npm run init-db:seed
```

---

## Auto-Initialization on Server Start

You can enable automatic database initialization when the server starts:

### Railway

Add environment variable:
```
AUTO_INIT_DB=true
```

The server will automatically check if the database exists and initialize it if needed.

### Local Development

```bash
AUTO_INIT_DB=true npm start
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATA_DIR` | Custom data directory path | `./data` |
| `RAILWAY_VOLUME_MOUNT_PATH` | Railway volume mount path | - |
| `AUTO_INIT_DB` | Auto-initialize on server start | `false` |

---

## Railway Setup

### With Volume (Recommended)

1. **Create Volume**:
   - Railway Dashboard → Settings → Volumes
   - Name: `data-storage`
   - Mount Path: `/data`

2. **Set Environment Variable**:
   ```
   DATA_DIR=/data
   AUTO_INIT_DB=true
   ```

3. **Deploy**: The database will auto-initialize on first deployment

### Without Volume

The database will be created in the service's file system (persists between deployments but not service recreations).

---

## Verification

After initialization, verify the database:

```bash
# Check data directory
ls -la data/

# View users (if seeded)
cat data/users.json
```

You should see all collection files created.

---

## Troubleshooting

### Permission Errors

```bash
chmod 755 data
chmod 644 data/*.json
```

### Script Not Found

Ensure `tsx` is installed:
```bash
npm install
```

### Data Not Persisting (Railway)

- Ensure volume is mounted correctly
- Check `DATA_DIR` environment variable
- Verify volume mount path in Railway dashboard

---

## Notes

- ✅ Script is **idempotent** - safe to run multiple times
- ✅ Existing files are **not overwritten**
- ✅ Seed data only added with `--seed` flag
- ✅ Works with Railway volumes automatically
- ✅ Compatible with local development

---

**Ready to go! Run `npm run init-db:seed` to get started! 🚀**
