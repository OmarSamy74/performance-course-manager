# 🗄️ How to Add Database to Railway - Step by Step

## Overview

You can add PostgreSQL database to your Railway project. I see you already have one deployed! But here are the complete steps for reference.

---

## Step 1: Access Your Railway Project

1. Go to **https://railway.app**
2. Login to your account
3. Click on your project: **`performance-course-manager`**
4. You should see the **Architecture** view (where you can see your services)

---

## Step 2: Add PostgreSQL Database

### Method 1: From Architecture View

1. In the **Architecture** view, look for the **"+"** button or **"New"** button
2. Click **"New"** or **"+"** button
3. A menu will appear with service options
4. Select **"Database"** → **"Add PostgreSQL"**
   - You'll see options like:
     - PostgreSQL
     - MySQL
     - MongoDB
     - Redis
5. Click **"PostgreSQL"**

### Method 2: From Project Dashboard

1. In your project dashboard
2. Click **"New"** button (top right)
3. Select **"Database"**
4. Choose **"PostgreSQL"**

---

## Step 3: Configure Database

1. Railway will automatically:
   - Create a new PostgreSQL service
   - Generate database credentials
   - Set up persistent volume for data
   - Start the database

2. Wait for deployment (usually 1-2 minutes)
   - You'll see "Deploying..." status
   - Then "Online" with green dot ✅

---

## Step 4: Get Database Connection Details

### 4.1 Access Database Variables

1. Click on the **PostgreSQL** service card
2. Go to **"Variables"** tab
3. You'll see these important variables:

**Connection Variables:**
- `PGHOST` - Database host
- `PGPORT` - Database port (usually 5432)
- `PGDATABASE` - Database name
- `PGUSER` - Database username
- `PGPASSWORD` - Database password

**Connection URL:**
- `DATABASE_URL` - Complete connection string
  - Format: `postgresql://user:password@host:port/database`

### 4.2 Copy Connection String

1. Find **`DATABASE_URL`** in the Variables list
2. Click the **eye icon** 👁️ to reveal the value
3. Click **"Copy"** button to copy the connection string
4. **Save this securely** - you'll need it for your app

---

## Step 5: Connect Database to Your App

### Option A: Use Environment Variables (Recommended)

1. Click on your **`performance-course-manager`** service (not the database)
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add the database connection:

**Method 1: Use DATABASE_URL**
- **Name**: `DATABASE_URL`
- **Value**: Copy from PostgreSQL service variables
- Click **"Add"**

**Method 2: Use Individual Variables**
- **Name**: `PGHOST`
- **Value**: Copy from PostgreSQL service
- Repeat for: `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

### Option B: Use Railway's Service Reference

Railway automatically provides database connection to services in the same project:
- Your app can access database via environment variables
- Railway injects connection details automatically

---

## Step 6: Update Your Application Code

### 6.1 Install PostgreSQL Client

Add to `package.json`:

```json
{
  "dependencies": {
    "pg": "^8.11.3"
  }
}
```

Or run:
```bash
npm install pg
npm install --save-dev @types/pg
```

### 6.2 Create Database Connection

Create `server/utils/database.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
```

### 6.3 Update Storage to Use Database

Update `server/utils/storage.ts` to use PostgreSQL instead of JSON files.

---

## Step 7: Verify Database Connection

### 7.1 Check Database Status

1. Go back to **Architecture** view
2. Check PostgreSQL service shows **"Online"** ✅
3. Green dot indicates it's running

### 7.2 Test Connection

1. In your app code, test the connection
2. Check Railway logs for connection errors
3. Verify data can be read/written

---

## Step 8: Database Management

### 8.1 View Database Logs

1. Click on **PostgreSQL** service
2. Go to **"Logs"** tab
3. View database activity and errors

### 8.2 Access Database Console (Optional)

1. Click on **PostgreSQL** service
2. Look for **"Connect"** or **"Query"** button
3. Or use external tools:
   - **pgAdmin**
   - **DBeaver**
   - **TablePlus**
   - Use the `DATABASE_URL` connection string

### 8.3 Database Backup

Railway automatically:
- Creates persistent volumes for data
- Backs up database data
- Data survives deployments

For manual backup:
1. Use `pg_dump` command
2. Or export via database client

---

## Step 9: Database Configuration Options

### 9.1 Database Settings

1. Click on **PostgreSQL** service
2. Go to **"Settings"** tab
3. Configure:
   - **Resource limits** (CPU, Memory)
   - **Auto-scaling**
   - **Restart policy**

### 9.2 Environment Variables

PostgreSQL service has these variables:
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_USER` - Database user
- `POSTGRES_DB` - Database name
- `DATABASE_URL` - Full connection string

---

## Step 10: Connect Multiple Services

If you have multiple services:

1. All services in the same project can access the database
2. Use `DATABASE_URL` environment variable
3. Railway automatically shares connection details

---

## Quick Reference

### Database Connection String Format

```
postgresql://username:password@host:port/database
```

Example:
```
postgresql://postgres:password123@containers-us-west-123.railway.app:5432/railway
```

### Environment Variables to Add to Your App

```
DATABASE_URL=postgresql://user:pass@host:port/db
```

Or individual variables:
```
PGHOST=containers-us-west-123.railway.app
PGPORT=5432
PGDATABASE=railway
PGUSER=postgres
PGPASSWORD=your_password
```

---

## Troubleshooting

### Database Not Connecting

1. **Check Variables**: Verify `DATABASE_URL` is set correctly
2. **Check Status**: Ensure PostgreSQL shows "Online"
3. **Check Logs**: View PostgreSQL logs for errors
4. **Check SSL**: Railway requires SSL in production

### Connection Timeout

1. Verify database is in same project
2. Check network settings
3. Verify firewall rules

### Authentication Failed

1. Check `PGPASSWORD` is correct
2. Verify `PGUSER` matches database user
3. Check connection string format

---

## Your Current Setup

Based on your Railway dashboard:

✅ **PostgreSQL Database**: Already deployed and Online  
✅ **Application**: `performance-course-manager` deployed  
✅ **Volume**: `postgres-volume` attached for persistence  

**Next Steps:**
1. Copy `DATABASE_URL` from PostgreSQL service
2. Add to your app's environment variables
3. Update your code to use PostgreSQL instead of JSON files

---

## Database vs File Storage

### Current Setup (File Storage)
- ✅ Simple, no database needed
- ✅ Works with JSON files
- ✅ Good for small to medium data

### With PostgreSQL
- ✅ Better for large datasets
- ✅ ACID transactions
- ✅ Better querying capabilities
- ✅ Scalable

**You can keep file storage OR switch to PostgreSQL - both work!**

---

## Need Help?

- Railway Docs: https://docs.railway.app/databases/postgresql
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Your database is ready! Just connect it to your app! 🚀**
