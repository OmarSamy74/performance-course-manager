# 🌐 Netlify CLI Setup Guide

## Quick Setup via Command Line

This guide will help you set up Netlify using the CLI (command line interface).

---

## Prerequisites

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```
   
   Or using Homebrew (macOS):
   ```bash
   brew install netlify-cli
   ```

2. **Verify Installation**:
   ```bash
   netlify --version
   ```

---

## Step-by-Step Setup

### Step 1: Login to Netlify

```bash
netlify login
```

This will open your browser to authenticate. After login, you'll be connected to Netlify.

### Step 2: Initialize Netlify Project

Navigate to your project directory:

```bash
cd /Users/omarsamy/Downloads/performance-course-manager
```

Initialize Netlify:

```bash
netlify init
```

This will:
- Create a new Netlify site (or link to existing)
- Set up the project
- Configure build settings

### Step 3: Link to Existing Site (If Already Created)

If you already have a Netlify site:

```bash
netlify link
```

Select your site from the list.

### Step 4: Set Environment Variables

Set all required environment variables:

```bash
# Set Node environment
netlify env:set NODE_ENV production

# Set API URL (use your Railway domain)
netlify env:set VITE_API_URL "https://performance-course-manager-production.up.railway.app/api"

# Set Node version
netlify env:set NODE_VERSION 18

# Set NPM config (important for devDependencies)
netlify env:set NPM_CONFIG_PRODUCTION false
```

### Step 5: Configure Build Settings

The `netlify.toml` file should already be configured, but verify:

```bash
cat netlify.toml
```

Should show:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_CONFIG_PRODUCTION = "false"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Step 6: Deploy

Deploy your application:

```bash
netlify deploy --prod
```

For a draft deployment (to test first):

```bash
netlify deploy
```

### Step 7: View Logs

View deployment logs:

```bash
netlify logs
```

Or follow logs in real-time:

```bash
netlify logs:watch
```

---

## Complete Setup Script

Here's a complete script to set everything up:

```bash
#!/bin/bash

# Navigate to project
cd /Users/omarsamy/Downloads/performance-course-manager

# Login to Netlify (if not already)
netlify login

# Initialize or link site
netlify init

# Set environment variables
netlify env:set NODE_ENV production
netlify env:set VITE_API_URL "https://performance-course-manager-production.up.railway.app/api"
netlify env:set NODE_VERSION 18
netlify env:set NPM_CONFIG_PRODUCTION false

# Deploy
netlify deploy --prod

# Show logs
netlify logs:watch
```

---

## Common Commands

### Check Status

```bash
# Show site status
netlify status

# Show site info
netlify sites:list

# Show current site
netlify status --json
```

### Environment Variables

```bash
# Set a variable
netlify env:set KEY value

# Get a variable
netlify env:get KEY

# List all variables
netlify env:list

# Delete a variable
netlify env:unset KEY

# Set for specific context
netlify env:set KEY value --context production
```

### Deployment

```bash
# Deploy to production
netlify deploy --prod

# Deploy draft (for testing)
netlify deploy

# Deploy with build
netlify deploy --build

# Deploy specific directory
netlify deploy --dir=dist

# Open deployed site
netlify open:site
```

### Functions

```bash
# List functions
netlify functions:list

# Invoke function locally
netlify functions:invoke function-name

# Serve functions locally
netlify dev
```

### Logs

```bash
# View logs
netlify logs

# Follow logs
netlify logs:watch

# Function logs
netlify functions:log
```

### Local Development

```bash
# Start local dev server
netlify dev

# This will:
# - Start local server
# - Run Netlify Functions locally
# - Watch for changes
```

---

## Troubleshooting "Application failed to respond"

### Issue 1: Build Failed

**Check build logs**:
```bash
netlify logs --build
```

**Common fixes**:
- Ensure `netlify.toml` has correct build command
- Check `NPM_CONFIG_PRODUCTION=false` is set
- Verify Node version compatibility
- Check for missing dependencies

### Issue 2: Functions Not Working

**Check function logs**:
```bash
netlify functions:log
```

**Common fixes**:
- Ensure functions are in `netlify/functions/` directory
- Check function exports are correct
- Verify function names match routes

### Issue 3: Environment Variables Missing

**Check variables**:
```bash
netlify env:list
```

**Set missing variables**:
```bash
netlify env:set NODE_ENV production
netlify env:set VITE_API_URL "https://performance-course-manager-production.up.railway.app/api"
```

### Issue 4: Build Command Fails

**Check build locally**:
```bash
npm run build
```

**Common causes**:
- Missing dependencies
- TypeScript errors
- Build configuration issues

### Issue 5: Site Not Accessible

**Check deployment status**:
```bash
netlify status
```

**Check site URL**:
```bash
netlify open:site
```

**Common causes**:
- Build failed
- DNS issues
- Site not published

---

## Quick Fix Script

If your app is failing, run this:

```bash
#!/bin/bash

echo "🔧 Fixing Netlify deployment..."

# Check status
echo "📊 Checking status..."
netlify status

# Check variables
echo "🔑 Checking environment variables..."
netlify env:list

# Check build locally
echo "🔨 Testing build locally..."
npm run build

# Set required variables
echo "⚙️ Setting required variables..."
netlify env:set NODE_ENV production
netlify env:set VITE_API_URL "https://performance-course-manager-production.up.railway.app/api"
netlify env:set NPM_CONFIG_PRODUCTION false

# Redeploy
echo "🚀 Redeploying..."
netlify deploy --prod

# Show logs
echo "📋 Following logs..."
netlify logs:watch
```

---

## Verify Setup

### 1. Check Deployment

```bash
netlify status
```

Should show:
- ✅ Site is live
- ✅ Deployment successful
- ✅ Domain configured

### 2. Check Logs

```bash
netlify logs --tail 50
```

Should show:
- ✅ Build successful
- ✅ Functions deployed
- ✅ Site published

### 3. Test Site

```bash
# Open site in browser
netlify open:site

# Or test API
curl https://your-site.netlify.app/.netlify/functions/auth
```

### 4. Check Variables

```bash
netlify env:list
```

Should show:
- `NODE_ENV=production`
- `VITE_API_URL=...`
- `NPM_CONFIG_PRODUCTION=false`

---

## Advanced: Continuous Deployment

### Connect to GitHub

```bash
# Link to Git repository
netlify init

# Or manually connect
netlify sites:create --name your-site-name
```

### Configure Build Hooks

```bash
# Create build hook
netlify build:hooks:create

# List build hooks
netlify build:hooks:list
```

---

## Local Development

### Start Dev Server

```bash
netlify dev
```

This will:
- Start local server (usually on port 8888)
- Run Netlify Functions locally
- Watch for changes
- Hot reload on file changes

### Test Functions Locally

```bash
# Start dev server
netlify dev

# In another terminal, test function
curl http://localhost:8888/.netlify/functions/auth
```

---

## Complete Setup Checklist

- [ ] Netlify CLI installed
- [ ] Logged in: `netlify login`
- [ ] Site initialized: `netlify init` or `netlify link`
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `VITE_API_URL=...`
  - [ ] `NPM_CONFIG_PRODUCTION=false`
- [ ] `netlify.toml` configured correctly
- [ ] Deployed: `netlify deploy --prod`
- [ ] Site accessible via domain
- [ ] Functions working

---

## Getting Help

### Check Logs

```bash
# Full logs
netlify logs

# Last 100 lines
netlify logs --tail 100

# Follow in real-time
netlify logs:watch

# Build logs only
netlify logs --build

# Function logs
netlify functions:log
```

### Netlify Dashboard

If CLI doesn't work, use the dashboard:
- https://app.netlify.com
- Navigate to your site
- Check Deploys, Functions, Environment variables

### Netlify Docs

- CLI Docs: https://cli.netlify.com
- Common Errors: https://docs.netlify.com/troubleshooting/common-issues

---

## Quick Reference

```bash
# Login
netlify login

# Initialize
netlify init

# Link existing
netlify link

# Set variables
netlify env:set KEY value

# Deploy
netlify deploy --prod

# View logs
netlify logs:watch

# Local dev
netlify dev

# Check status
netlify status

# Open site
netlify open:site
```

---

## Differences from Railway

| Feature | Railway | Netlify |
|---------|---------|---------|
| **Deployment** | `railway up` | `netlify deploy --prod` |
| **Variables** | `railway variables set` | `netlify env:set` |
| **Logs** | `railway logs` | `netlify logs` |
| **Local Dev** | `railway run` | `netlify dev` |
| **Functions** | Express routes | `netlify/functions/` |
| **Config** | `railway.json` | `netlify.toml` |

---

**Run these commands to set up Netlify via CLI! 🚀**
