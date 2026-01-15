# Database Initialization Scripts

## Overview

This directory contains scripts for initializing and managing the file-based JSON database.

## Scripts

### `init-database.ts`

Initializes the database by creating all necessary JSON files and optionally seeding initial data.

#### Usage

```bash
# Initialize empty database (creates all collection files)
npm run init-db

# Initialize database with seed data (creates files + initial users)
npm run init-db:seed
```

#### What It Does

1. **Creates `/data` directory** (if it doesn't exist)
2. **Creates empty JSON files** for all collections:
   - `users.json` - User accounts
   - `sessions.json` - Active sessions
   - `students.json` - Student records
   - `leads.json` - CRM leads
   - `materials.json` - Course materials
   - `lessons.json` - Lessons
   - `assignments.json` - Assignments
   - `submissions.json` - Assignment submissions
   - `quizzes.json` - Quizzes
   - `attempts.json` - Quiz attempts
   - `progress.json` - Student progress
   - `grades.json` - Grades

3. **Seeds initial users** (if `--seed` flag is used):
   - Admin: `admin` / `123`
   - Teacher: `teacher` / `123`
   - Sales: `sales` / `123`
   - Omar Samy: `omar.samy` / `123`
   - Abdelatif Reda: `abdelatif.reda` / `123`
   - Karim Ali: `karim.ali` / `123`

#### When to Use

- **First time setup**: Run `npm run init-db:seed` to set up the database
- **After deployment**: Run `npm run init-db` to ensure all collections exist
- **Reset database**: Delete `/data` folder and run `npm run init-db:seed`

#### Environment Variables

The script respects the same environment variables as the storage system:

- `DATA_DIR` - Custom data directory path (default: `./data`)
- `RAILWAY_VOLUME_MOUNT_PATH` - Railway volume mount path

#### Example Output

```
🚀 Initializing database...

📁 Data directory: /path/to/data

✅ Data directory created: /path/to/data

📝 Creating collection files...
✅ Created users.json
✅ Created sessions.json
✅ Created students.json
✅ Created leads.json
✅ Created materials.json
✅ Created lessons.json
✅ Created assignments.json
✅ Created submissions.json
✅ Created quizzes.json
✅ Created attempts.json
✅ Created progress.json
✅ Created grades.json

🌱 Seeding initial data...
✅ Seeded 6 initial users

✨ Database initialization complete!

📊 Collections initialized: 12
🌱 Initial users seeded

💡 Tip: Use 'npm run init-db -- --seed' to seed initial data
```

## Notes

- The script is **idempotent** - safe to run multiple times
- Existing files are **not overwritten** - only new files are created
- Seed data is only added if `--seed` flag is used
- The script uses the same storage utilities as the application

## Troubleshooting

### Permission Errors

If you get permission errors, ensure the data directory is writable:

```bash
chmod 755 data
```

### Railway Deployment

On Railway, the script will automatically use the mounted volume if configured:

1. Railway Dashboard → Settings → Volumes
2. Mount path: `/data`
3. The script will detect and use this path automatically

### Local Development

For local development, the script creates a `./data` directory in the project root.
