# 🚂 Railway CLI Setup Guide

## Quick Setup via Command Line

This guide will help you set up Railway using the CLI (command line interface).

---

## Prerequisites

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```
   
   Or using Homebrew (macOS):
   ```bash
   brew install railway
   ```

2. **Verify Installation**:
   ```bash
   railway --version
   ```

---

## Step-by-Step Setup

### Step 1: Login to Railway

```bash
railway login
```

This will open your browser to authenticate. After login, you'll be connected to Railway.

### Step 2: Initialize Railway Project

Navigate to your project directory:

```bash
cd /Users/omarsamy/Downloads/performance-course-manager
```

Initialize Railway:

```bash
railway init
```

This will:
- Create a new Railway project (or link to existing)
- Create a `railway.json` file (if it doesn't exist)
- Set up the project

### Step 3: Link to Existing Project (If Already Created)

If you already have a Railway project:

```bash
railway link
```

Select your project from the list.

### Step 4: Set Environment Variables

Set all required environment variables:

```bash
# Set Node environment
railway variables set NODE_ENV=production

# Set PORT (Railway auto-sets this, but you can override)
railway variables set PORT=3001

# Set API URL (use your Railway domain)
railway variables set VITE_API_URL=https://performance-course-manager-production.up.railway.app/api

# Enable auto-database initialization (optional)
railway variables set AUTO_INIT_DB=true

# Set data directory (if using volume)
railway variables set DATA_DIR=/data
```

### Step 5: Configure Networking (Port)

Check what port Railway detected:

```bash
railway status
```

Or check variables:

```bash
railway variables
```

Then configure the public domain:

```bash
# Generate a public domain
railway domain

# Or use existing domain and set port
railway service
# Then configure networking in Railway dashboard
```

**Note**: Port configuration might need to be done in Railway dashboard:
1. Go to Railway Dashboard → Your Service → Settings → Networking
2. Set target port to match your PORT variable

### Step 6: Deploy

Deploy your application:

```bash
railway up
```

This will:
- Build your application
- Deploy to Railway
- Show deployment logs

### Step 7: View Logs

Watch deployment and runtime logs:

```bash
railway logs
```

Or follow logs in real-time:

```bash
railway logs --follow
```

---

## Complete Setup Script

Here's a complete script to set everything up:

```bash
#!/bin/bash

# Navigate to project
cd /Users/omarsamy/Downloads/performance-course-manager

# Login to Railway (if not already)
railway login

# Initialize or link project
railway init

# Set environment variables
railway variables set NODE_ENV=production
railway variables set VITE_API_URL=https://performance-course-manager-production.up.railway.app/api
railway variables set AUTO_INIT_DB=true

# Deploy
railway up

# Show logs
railway logs --follow
```

---

## Common Commands

### Check Status

```bash
# Show project status
railway status

# List all services
railway service

# Show environment variables
railway variables
```

### Environment Variables

```bash
# Set a variable
railway variables set KEY=value

# Get a variable
railway variables get KEY

# List all variables
railway variables

# Delete a variable
railway variables unset KEY
```

### Deployment

```bash
# Deploy current directory
railway up

# Deploy with specific service
railway up --service <service-name>

# View deployment logs
railway logs

# Follow logs in real-time
railway logs --follow
```

### Database Initialization

```bash
# Run database init script
railway run npm run init-db:seed
```

### Shell Access

```bash
# Open shell in Railway environment
railway shell

# Run a command
railway run <command>
```

---

## Troubleshooting "Application failed to respond"

### Issue 1: Port Mismatch

**Check current port**:
```bash
railway variables get PORT
```

**Check logs**:
```bash
railway logs
```

Look for: `🚀 Server running on port XXXX`

**Fix**: Ensure Railway networking target port matches the PORT variable.

### Issue 2: Build Failed

**Check build logs**:
```bash
railway logs --deployment
```

**Common fixes**:
- Ensure `package.json` has correct `start` script
- Check Node version compatibility
- Verify all dependencies are in `dependencies` (not just `devDependencies`)

### Issue 3: Database Not Initialized

**Initialize database**:
```bash
railway run npm run init-db:seed
```

Or enable auto-initialization:
```bash
railway variables set AUTO_INIT_DB=true
```

### Issue 4: Environment Variables Missing

**Check variables**:
```bash
railway variables
```

**Set missing variables**:
```bash
railway variables set NODE_ENV=production
railway variables set VITE_API_URL=https://performance-course-manager-production.up.railway.app/api
```

### Issue 5: Application Crashes on Start

**Check runtime logs**:
```bash
railway logs --follow
```

**Common causes**:
- Missing environment variables
- Port already in use
- Database connection issues
- Missing dependencies

---

## Quick Fix Script

If your app is failing, run this:

```bash
#!/bin/bash

echo "🔧 Fixing Railway deployment..."

# Check status
echo "📊 Checking status..."
railway status

# Check variables
echo "🔑 Checking environment variables..."
railway variables

# Check logs
echo "📋 Recent logs:"
railway logs --tail 50

# Set required variables
echo "⚙️ Setting required variables..."
railway variables set NODE_ENV=production
railway variables set AUTO_INIT_DB=true

# Initialize database
echo "🗄️ Initializing database..."
railway run npm run init-db:seed

# Redeploy
echo "🚀 Redeploying..."
railway up

# Show logs
echo "📋 Following logs..."
railway logs --follow
```

---

## Verify Setup

### 1. Check Deployment

```bash
railway status
```

Should show:
- ✅ Service is running
- ✅ Deployment successful
- ✅ Domain configured

### 2. Check Logs

```bash
railway logs
```

Should show:
```
🚀 Server running on port 3001
📁 Data directory: /data
```

### 3. Test API

```bash
curl https://performance-course-manager-production.up.railway.app/api/auth
```

Should return a response (even if error, means server is running).

### 4. Check Variables

```bash
railway variables
```

Should show:
- `NODE_ENV=production`
- `PORT=3001` (or similar)
- `VITE_API_URL=...` (if set)

---

## Advanced: Using Volumes (Persistent Storage)

### Create Volume

```bash
# Create a volume
railway volume create data-storage

# Mount volume
railway volume mount data-storage /data
```

### Set Volume Path

```bash
railway variables set DATA_DIR=/data
```

---

## Complete Setup Checklist

- [ ] Railway CLI installed
- [ ] Logged in: `railway login`
- [ ] Project initialized: `railway init` or `railway link`
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `VITE_API_URL=...`
  - [ ] `AUTO_INIT_DB=true` (optional)
- [ ] Database initialized: `railway run npm run init-db:seed`
- [ ] Deployed: `railway up`
- [ ] Networking configured (check dashboard for port)
- [ ] Application accessible via domain

---

## Getting Help

### Check Logs

```bash
# Full logs
railway logs

# Last 100 lines
railway logs --tail 100

# Follow in real-time
railway logs --follow

# Deployment logs only
railway logs --deployment
```

### Railway Dashboard

If CLI doesn't work, use the dashboard:
- https://railway.app/dashboard
- Navigate to your project
- Check Deployments, Logs, Variables, Networking

### Railway Docs

- CLI Docs: https://docs.railway.app/develop/cli
- Common Errors: https://docs.railway.app/help/fix-common-errors

---

## Quick Reference

```bash
# Login
railway login

# Initialize
railway init

# Link existing
railway link

# Set variables
railway variables set KEY=value

# Deploy
railway up

# View logs
railway logs --follow

# Run command
railway run <command>

# Check status
railway status
```

---

**Run these commands to set up Railway via CLI! 🚀**
