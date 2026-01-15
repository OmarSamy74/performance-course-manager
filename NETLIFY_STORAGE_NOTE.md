# ⚠️ Important: Netlify Functions Storage

## Current Setup

Netlify Functions now use **file-based storage** in `/tmp/data` directory.

## ⚠️ Important Limitation

**Netlify Functions `/tmp` directory is ephemeral:**
- Data is stored in `/tmp/data` (writable directory)
- **Data does NOT persist** between function invocations
- Each function invocation gets a fresh `/tmp` directory
- Data is lost when function container restarts

## Solutions for Persistent Storage

### Option 1: Use External Database (Recommended)

For production, use an external database:

**Supabase (Free PostgreSQL)**
1. Create account at https://supabase.com
2. Get connection string
3. Add `DATABASE_URL` to Netlify environment variables
4. Update functions to use PostgreSQL

**Other Options:**
- MongoDB Atlas
- PlanetScale
- Fauna
- Any external database

### Option 2: Use Netlify Blob Storage

Netlify's built-in blob storage:

```typescript
import { getStore } from "@netlify/blobs";

const store = getStore("my-data");
await store.set("key", "value");
const data = await store.get("key");
```

### Option 3: Use Railway Backend

Since you have Railway deployed:
- Keep Express server on Railway (persistent storage)
- Use Netlify only for frontend
- Point frontend API to Railway URL

## Current Behavior

With file-based storage in `/tmp`:
- ✅ Functions will work
- ✅ Data persists during single function execution
- ❌ Data is lost between invocations
- ❌ Not suitable for production data

## Recommendation

**For Production:**
1. Use Railway backend (already deployed)
2. Or add Supabase/PostgreSQL database
3. Or use Netlify Blob storage

**For Development/Testing:**
- Current file-based storage is fine
- Good for testing functions

---

**Note**: The build error is now fixed, but consider adding persistent storage for production use.
