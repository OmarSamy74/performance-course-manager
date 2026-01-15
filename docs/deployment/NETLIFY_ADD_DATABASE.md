# 🗄️ How to Add Database to Netlify - Step by Step

## Overview

Netlify doesn't have built-in databases like Railway, but you can easily connect external databases. Here are the best options and step-by-step instructions.

---

## Option 1: Supabase (Recommended - Free PostgreSQL)

Supabase is a free, open-source Firebase alternative with PostgreSQL database. Perfect for Netlify!

### Step 1: Create Supabase Account

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Create a new organization (if first time)

### Step 2: Create New Project

1. Click **"New Project"** button
2. Fill in details:
   - **Name**: `performance-course-manager`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup

### Step 3: Get Database Connection Details

1. In your Supabase project dashboard
2. Go to **"Settings"** (gear icon) → **"Database"**
3. Scroll to **"Connection string"** section
4. Find **"URI"** or **"Connection string"**
5. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. Or copy individual values:
   - **Host**: `db.xxxxx.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: (the one you created)

### Step 4: Add to Netlify Environment Variables

1. Go to your Netlify dashboard
2. Select your site: **`performance-course-manager`**
3. Go to **"Site configuration"** → **"Environment variables"**
4. Click **"Add a variable"**
5. Add these variables:

**Option A: Full Connection String**
- **Key**: `DATABASE_URL`
- **Value**: Paste the full connection string from Supabase
- Click **"Save"**

**Option B: Individual Variables**
- **Key**: `DB_HOST` → Value: `db.xxxxx.supabase.co`
- **Key**: `DB_PORT` → Value: `5432`
- **Key**: `DB_NAME` → Value: `postgres`
- **Key**: `DB_USER` → Value: `postgres`
- **Key**: `DB_PASSWORD` → Value: Your password

### Step 5: Update Your Netlify Functions

Update your functions to use the database:

```typescript
// netlify/functions/utils/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;
```

### Step 6: Install PostgreSQL Client

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
```

---

## Option 2: PlanetScale (MySQL - Free Tier)

### Step 1: Create PlanetScale Account

1. Go to **https://planetscale.com**
2. Sign up with GitHub
3. Create a new database

### Step 2: Get Connection String

1. In PlanetScale dashboard
2. Click on your database
3. Go to **"Connect"** tab
4. Copy the connection string
5. Add to Netlify environment variables as `DATABASE_URL`

---

## Option 3: MongoDB Atlas (Free Tier)

### Step 1: Create MongoDB Account

1. Go to **https://www.mongodb.com/cloud/atlas**
2. Sign up for free
3. Create a free cluster

### Step 2: Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
4. Add to Netlify as `MONGODB_URI`

---

## Option 4: Fauna (Serverless Database)

### Step 1: Create Fauna Account

1. Go to **https://fauna.com**
2. Sign up for free
3. Create a new database

### Step 2: Get API Key

1. Go to **"Security"** → **"Keys"**
2. Create a new key
3. Copy the secret
4. Add to Netlify as `FAUNA_SECRET`

---

## Option 5: Netlify's Built-in Storage (Netlify Blob)

Netlify offers Blob storage for simple key-value storage:

### Step 1: Enable Netlify Blob

1. In Netlify dashboard → Your site
2. Go to **"Plugins"** or **"Add-ons"**
3. Search for **"Netlify Blob"**
4. Click **"Install"**

### Step 2: Use in Functions

```typescript
import { getStore } from "@netlify/blobs";

const store = getStore("my-data");
await store.set("key", "value");
const data = await store.get("key");
```

---

## Recommended: Supabase Setup (Complete Guide)

### Why Supabase?

✅ **Free tier** with generous limits  
✅ **PostgreSQL** database (industry standard)  
✅ **Real-time** subscriptions  
✅ **Auto-generated APIs**  
✅ **Built-in auth** (optional)  
✅ **Easy to use** with Netlify  

### Complete Supabase + Netlify Setup

#### 1. Create Supabase Project
- Follow steps above

#### 2. Create Database Tables

In Supabase SQL Editor, run:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  role TEXT NOT NULL,
  student_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  plan TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);
```

#### 3. Add Environment Variables to Netlify

1. Netlify Dashboard → Your Site
2. **Site settings** → **Environment variables**
3. Add:
   - `DATABASE_URL` = Your Supabase connection string
   - `SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_ANON_KEY` = Your Supabase anon key (optional)

#### 4. Update Netlify Functions

```typescript
// netlify/functions/utils/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export default pool;
```

#### 5. Update Storage Functions

Replace JSON file storage with database queries:

```typescript
// Example: Read students
export async function readData(collectionName: string) {
  const result = await pool.query(`SELECT * FROM ${collectionName}`);
  return result.rows;
}
```

---

## Environment Variables Setup

### Netlify Dashboard Steps

1. **Go to Netlify Dashboard**
   - https://app.netlify.com

2. **Select Your Site**
   - Click on `performance-course-manager`

3. **Access Environment Variables**
   - **Site configuration** → **Environment variables**
   - Or: **Site settings** → **Build & deploy** → **Environment**

4. **Add Variables**
   - Click **"Add a variable"**
   - Enter **Key** and **Value**
   - Choose **Scope**:
     - **All scopes** (default)
     - **Production**
     - **Deploy previews**
     - **Branch deploys**
   - Click **"Save"**

5. **Redeploy**
   - After adding variables, trigger a new deploy
   - Go to **"Deploys"** tab
   - Click **"Trigger deploy"** → **"Deploy site"**

---

## Testing Database Connection

### Test in Netlify Function

Create a test function:

```typescript
// netlify/functions/test-db.ts
import { Handler } from '@netlify/functions';
import pool from './utils/database';

export const handler: Handler = async (event, context) => {
  try {
    const result = await pool.query('SELECT NOW()');
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        time: result.rows[0].now 
      })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message 
      })
    };
  }
};
```

Test it:
```
https://your-site.netlify.app/.netlify/functions/test-db
```

---

## Database Options Comparison

| Database | Free Tier | Type | Best For |
|----------|-----------|------|----------|
| **Supabase** | ✅ Yes | PostgreSQL | General use, real-time |
| **PlanetScale** | ✅ Yes | MySQL | Scalable apps |
| **MongoDB Atlas** | ✅ Yes | NoSQL | Document storage |
| **Fauna** | ✅ Yes | Serverless | Serverless apps |
| **Netlify Blob** | ✅ Yes | Key-Value | Simple storage |

---

## Quick Setup Checklist

### Supabase (Recommended)

- [ ] Create Supabase account
- [ ] Create new project
- [ ] Copy connection string
- [ ] Add `DATABASE_URL` to Netlify
- [ ] Install `pg` package
- [ ] Update functions to use database
- [ ] Test connection
- [ ] Deploy

---

## Troubleshooting

### Connection Failed

1. **Check Environment Variables**
   - Verify `DATABASE_URL` is set correctly
   - Check for typos in connection string

2. **Check SSL**
   - Most cloud databases require SSL
   - Add `ssl: { rejectUnauthorized: false }` to connection

3. **Check IP Whitelist**
   - Some databases require IP whitelisting
   - Netlify functions use dynamic IPs
   - Use connection string with password instead

### Timeout Errors

1. **Check Database Status**
   - Verify database is running
   - Check database logs

2. **Check Connection Pool**
   - Limit connection pool size
   - Close connections properly

### Authentication Errors

1. **Verify Credentials**
   - Check username/password
   - Verify connection string format

---

## Migration from File Storage

If you're currently using file storage:

1. **Export Current Data**
   - Download JSON files from your current storage

2. **Import to Database**
   - Create migration script
   - Import data to new database

3. **Update Functions**
   - Replace file read/write with database queries
   - Test thoroughly

---

## Cost Comparison

### Free Tiers

- **Supabase**: 500MB database, 2GB bandwidth
- **PlanetScale**: 5GB storage, unlimited reads
- **MongoDB Atlas**: 512MB storage
- **Fauna**: 100K reads/day, 50K writes/day
- **Netlify Blob**: 100MB storage

---

## Recommended Setup for Your Project

**Best Choice: Supabase**

1. ✅ Free PostgreSQL database
2. ✅ Easy to set up
3. ✅ Works great with Netlify Functions
4. ✅ Good documentation
5. ✅ Generous free tier

**Steps:**
1. Sign up at supabase.com
2. Create project
3. Copy `DATABASE_URL`
4. Add to Netlify environment variables
5. Update your functions

---

## Next Steps

1. Choose a database provider (Supabase recommended)
2. Create account and project
3. Get connection string
4. Add to Netlify environment variables
5. Update your code
6. Test and deploy

---

**Your database is ready! Connect it to Netlify! 🚀**
