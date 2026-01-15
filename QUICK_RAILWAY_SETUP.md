# 🚀 Quick Railway Setup

## Step 1: Login (Required - Interactive)

Open your terminal and run:

```bash
cd /Users/omarsamy/Downloads/performance-course-manager
railway login
```

This will open your browser for authentication. After logging in, continue with Step 2.

## Step 2: Run Setup Script

After logging in, run:

```bash
./setup-railway.sh
```

Or run commands manually:

```bash
# Link to project
railway link

# Set environment variables
railway variables set NODE_ENV=production
railway variables set VITE_API_URL=https://performance-course-manager-production.up.railway.app/api
railway variables set AUTO_INIT_DB=true

# Initialize database
railway run npm run init-db:seed

# Deploy
railway up

# View logs
railway logs --follow
```

## Manual Commands (If Script Doesn't Work)

```bash
# 1. Login (interactive - opens browser)
railway login

# 2. Link to existing project
railway link
# Select your project from the list

# 3. Set variables
railway variables set NODE_ENV=production
railway variables set VITE_API_URL=https://performance-course-manager-production.up.railway.app/api
railway variables set AUTO_INIT_DB=true

# 4. Initialize database
railway run npm run init-db:seed

# 5. Check status
railway status

# 6. Deploy
railway up

# 7. View logs
railway logs --follow
```

## Troubleshooting

### "Cannot login in non-interactive mode"
- Run `railway login` manually in your terminal (not via script)
- It will open your browser for authentication

### "Project not linked"
- Run `railway link` manually
- Select your existing project from the list

### Check what's wrong
```bash
railway logs --tail 100
railway status
railway variables
```
