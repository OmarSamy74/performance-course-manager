# 🔗 Getting Railway DATABASE_URL

## ⚠️ Important: Internal vs Public URL

Railway provides two types of DATABASE_URL:

1. **Internal URL** (`.railway.internal`) - Only works inside Railway's network
2. **Public URL** - Works from anywhere (your local machine, etc.)

## 📋 How to Get the Public DATABASE_URL

### Method 1: Railway Dashboard (Recommended)

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Click on your **PostgreSQL** service
4. Go to **Variables** tab
5. Look for `DATABASE_URL` - this should be the **public** URL
6. If you see `postgres.railway.internal`, you need the public one

### Method 2: Railway CLI

```bash
# Install Railway CLI if not installed
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Get DATABASE_URL
railway variables
```

### Method 3: Railway Dashboard - Connection Tab

1. Go to your PostgreSQL service in Railway
2. Click on **"Connect"** or **"Connection"** tab
3. Look for **"Public Network"** connection string
4. Copy the connection URL (should NOT have `.railway.internal`)

## 🔍 Identifying the Correct URL

### ❌ Internal URL (Won't work locally):
```
postgresql://postgres:password@postgres.railway.internal:5432/railway
```
- Contains `.railway.internal`
- Only works inside Railway's network
- Won't work from your local machine

### ✅ Public URL (Works from anywhere):
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```
- Contains `.railway.app` or similar public domain
- Works from your local machine
- Works from anywhere with internet access

## 🛠️ Using the Public URL

Once you have the public DATABASE_URL:

```bash
DATABASE_URL="postgresql://postgres:password@host.railway.app:5432/railway" npm run update-passwords:pg
```

## 🔐 Security Note

- Never commit DATABASE_URL to git
- Use environment variables
- The public URL is still secure (requires password)
- Railway automatically manages firewall rules

## 📚 Related

- [Quick Update Passwords Guide](./QUICK_UPDATE_PASSWORDS.md)
- [User Password Management](./USER_PASSWORD_MANAGEMENT.md)
