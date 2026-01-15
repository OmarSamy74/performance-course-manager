# 🗄️ PostgreSQL Setup for Netlify

## Overview

Netlify Functions now support PostgreSQL! When `DATABASE_URL` is set, Netlify functions will automatically use PostgreSQL instead of ephemeral file storage.

---

## 🚀 Setup on Netlify

### Option 1: Use Railway PostgreSQL (Recommended)

If you're using Railway for your backend, you can share the same PostgreSQL database:

1. **Get Railway DATABASE_URL**:
   - Railway Dashboard → PostgreSQL Service → Variables
   - Copy the `DATABASE_URL` value

2. **Set Netlify Environment Variable**:
   - Netlify Dashboard → Site Settings → Environment Variables
   - Add: `DATABASE_URL` = `[your Railway PostgreSQL connection string]`

3. **Deploy**:
   - Netlify will automatically use PostgreSQL for all functions

### Option 2: Add PostgreSQL to Netlify

1. **Netlify Dashboard** → Your Site → **Add-ons**
2. Click **"Browse add-ons"** → Search **"PostgreSQL"**
3. Add a PostgreSQL add-on (e.g., **"Postgres"** by Netlify or **"Supabase"**)
4. The `DATABASE_URL` will be automatically set

---

## ✅ How It Works

### Automatic Detection

- **If `DATABASE_URL` is set**: Functions use PostgreSQL
- **If `DATABASE_URL` is not set**: Functions use file-based storage (`/tmp/data`)

### Database Schema

The same schema is used for both Railway and Netlify:
- All tables are created automatically on first use
- Same structure as Railway PostgreSQL

---

## 🔧 Environment Variables

### Required (for PostgreSQL)
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### Optional
```
DATA_DIR=/tmp/data  # Only used if DATABASE_URL is not set
```

---

## 📊 Benefits

### Using PostgreSQL on Netlify:
- ✅ **Persistent data** - Data survives function invocations
- ✅ **Shared database** - Same data as Railway backend
- ✅ **Better performance** - Faster queries than file I/O
- ✅ **Scalability** - Handles concurrent requests better

### Without PostgreSQL (File Storage):
- ⚠️ **Ephemeral** - Data in `/tmp` is cleared between invocations
- ⚠️ **Not shared** - Separate from Railway backend
- ⚠️ **Slower** - File I/O is slower than database queries

---

## 🔍 Verify It's Working

### Check Logs

1. **Netlify Dashboard** → Functions → View logs
2. Look for:
   ```
   ✅ PostgreSQL connected
   ✅ Database schema initialized
   ```

### Test API

```bash
# Test if data persists
curl https://your-site.netlify.app/.netlify/functions/students
```

If you see data, PostgreSQL is working!

---

## 🚨 Troubleshooting

### Issue: Functions still use file storage

**Solution**: 
- Check that `DATABASE_URL` is set in Netlify environment variables
- Redeploy after adding the variable
- Check function logs for PostgreSQL connection errors

### Issue: "relation does not exist" error

**Solution**:
- The database schema needs to be initialized
- This happens automatically on first function call
- If it fails, check that `DATABASE_URL` is correct

### Issue: Connection timeout

**Solution**:
- Ensure PostgreSQL allows connections from Netlify IPs
- Check firewall/security settings
- Verify `DATABASE_URL` includes correct host and port

---

## 📝 Notes

- **Shared Database**: If using Railway PostgreSQL, both Railway backend and Netlify functions share the same database
- **Auto-initialization**: Schema is created automatically on first use
- **Fallback**: If PostgreSQL fails, functions automatically fall back to file storage
- **No Code Changes**: All existing function code works the same way

---

**That's it! Your Netlify functions now use PostgreSQL! 🚀**
