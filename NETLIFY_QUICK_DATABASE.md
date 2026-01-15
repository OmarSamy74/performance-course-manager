# 🗄️ Quick Database Setup - Netlify

## Best Option: Supabase (Free PostgreSQL)

Netlify doesn't have built-in databases, but Supabase is the easiest option!

---

## 3-Step Setup

### Step 1: Create Supabase Database

1. Go to **https://supabase.com**
2. Sign up (free)
3. Click **"New Project"**
4. Wait 2 minutes for setup
5. Go to **Settings** → **Database**
6. Copy **Connection string**

### Step 2: Add to Netlify

1. Netlify Dashboard → Your Site
2. **Site settings** → **Environment variables**
3. Click **"Add a variable"**
4. **Key**: `DATABASE_URL`
5. **Value**: Paste Supabase connection string
6. Click **"Save"**

### Step 3: Install & Update Code

```bash
npm install pg
```

Update your functions to use:
```typescript
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

---

## Other Options

- **PlanetScale** (MySQL) - https://planetscale.com
- **MongoDB Atlas** - https://mongodb.com/cloud/atlas
- **Fauna** - https://fauna.com
- **Netlify Blob** - Built-in key-value storage

---

## Why Supabase?

✅ Free PostgreSQL  
✅ Easy setup  
✅ Works with Netlify Functions  
✅ Good free tier  

---

**That's it! Your database is ready! 🚀**
