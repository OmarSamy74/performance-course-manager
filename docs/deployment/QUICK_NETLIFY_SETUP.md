# 🚀 Quick Netlify Setup

## Step 1: Login (Required - Interactive)

Open your terminal and run:

```bash
cd /Users/omarsamy/Downloads/performance-course-manager
netlify login
```

This will open your browser for authentication. After logging in, continue with Step 2.

## Step 2: Run Setup Script

After logging in, run:

```bash
./setup-netlify.sh
```

Or run commands manually:

```bash
# Link to site
netlify link

# Set environment variables
netlify env:set NODE_ENV production
netlify env:set VITE_API_URL "https://performance-course-manager-production.up.railway.app/api"
netlify env:set NODE_VERSION 18
netlify env:set NPM_CONFIG_PRODUCTION false

# Test build
npm run build

# Deploy
netlify deploy --prod

# View logs
netlify logs:watch
```

## Manual Commands (If Script Doesn't Work)

```bash
# 1. Login (interactive - opens browser)
netlify login

# 2. Link to existing site
netlify link
# Select your site from the list

# 3. Set variables
netlify env:set NODE_ENV production
netlify env:set VITE_API_URL "https://performance-course-manager-production.up.railway.app/api"
netlify env:set NODE_VERSION 18
netlify env:set NPM_CONFIG_PRODUCTION false

# 4. Test build locally
npm run build

# 5. Check status
netlify status

# 6. Deploy
netlify deploy --prod

# 7. View logs
netlify logs:watch
```

## Troubleshooting

### "Not logged in"
- Run `netlify login` manually in your terminal (not via script)
- It will open your browser for authentication

### "Site not linked"
- Run `netlify link` manually
- Select your existing site from the list

### Build fails
```bash
# Test build locally first
npm run build

# Check for errors
npm install  # Ensure dependencies are installed
```

### Functions not working
```bash
# Check functions
netlify functions:list

# View function logs
netlify functions:log
```

### Check what's wrong
```bash
netlify logs --tail 100
netlify status
netlify env:list
```

## Local Development

Start local dev server with Netlify Functions:

```bash
netlify dev
```

This will:
- Start local server (usually port 8888)
- Run Netlify Functions locally
- Watch for changes
- Hot reload

## Key Differences from Railway

| Command | Railway | Netlify |
|---------|---------|---------|
| Deploy | `railway up` | `netlify deploy --prod` |
| Variables | `railway variables set` | `netlify env:set` |
| Logs | `railway logs` | `netlify logs` |
| Local Dev | `railway run` | `netlify dev` |

## Quick Commands

```bash
# Status
netlify status

# Deploy
netlify deploy --prod

# Logs
netlify logs:watch

# Open site
netlify open:site

# List functions
netlify functions:list

# Local dev
netlify dev
```
