# 🚂 Railway Deployment - Detailed Step-by-Step Guide

## Your Railway URL
**Production URL**: `https://performance-course-manager-production.up.railway.app`

---

## Step 1: Create Railway Account

### 1.1 Go to Railway Website
1. Open your web browser
2. Navigate to: **https://railway.app**
3. Click the **"Start a New Project"** button (top right corner)

### 1.2 Sign Up Options
Choose one of these methods:

**Option A: GitHub (Recommended)**
- Click **"Continue with GitHub"**
- You'll be redirected to GitHub
- Click **"Authorize Railway"** button
- Railway will request access to your repositories
- Click **"Authorize railway"** (green button)

**Option B: Google**
- Click **"Continue with Google"**
- Select your Google account
- Grant permissions

**Option C: Email**
- Enter your email address
- Check your email for verification link
- Click the verification link

### 1.3 Complete Setup
- After authorization, you'll be redirected to Railway dashboard
- You should see: "Welcome to Railway!" message

---

## Step 2: Create New Project

### 2.1 Start New Project
1. In Railway dashboard, click **"New Project"** button
   - Located at top right or center of the page
   - Button is usually blue/purple

### 2.2 Connect Repository
1. You'll see options:
   - **"Deploy from GitHub repo"** ← Click this
   - "Empty Project"
   - "Deploy from Dockerfile"

2. If first time connecting GitHub:
   - Click **"Configure GitHub App"**
   - Select repositories to give access:
     - **Option 1**: "Only select repositories" (Recommended)
     - **Option 2**: "All repositories"
   - Find and select: **`performance-course-manager`**
   - Click **"Install"**

3. After installation, you'll see your repositories list
4. Click on **`performance-course-manager`** repository

### 2.3 Project Detection
- Railway automatically detects it's a Node.js project
- It will show: "Node.js detected"
- Click **"Deploy Now"** or it will auto-deploy

---

## Step 3: Configure Environment Variables

### 3.1 Access Variables Tab
1. In your Railway project dashboard
2. Click on the service (usually shows your repo name)
3. Click the **"Variables"** tab at the top
   - It's next to "Deployments", "Metrics", "Settings"

### 3.2 Add Required Variables

Click **"New Variable"** for each variable below:

#### Variable 1: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- Click **"Add"**

#### Variable 2: PORT
- **Name**: `PORT`
- **Value**: `3001`
- Click **"Add"**
- *Note: Railway may auto-set this, but add it to be sure*

#### Variable 3: Firebase Configuration (Choose ONE method)

**Method A: Service Account Key (Recommended)**

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your Firebase project
3. Click the gear icon ⚙️ (top left) → **"Project Settings"**
4. Click **"Service Accounts"** tab
5. Click **"Generate new private key"** button
6. A JSON file will download
7. Open the downloaded JSON file
8. **Copy ALL the content** (Ctrl+A, Ctrl+C)
9. In Railway:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value**: Paste the ENTIRE JSON content
     - It should look like: `{"type":"service_account","project_id":"...","private_key_id":"...",...}`
   - Click **"Add"**

**Method B: Project ID Only**

1. Get your Firebase Project ID from Firebase Console
2. In Railway:
   - **Name**: `FIREBASE_PROJECT_ID`
   - **Value**: `your-project-id-here`
   - Click **"Add"**

#### Variable 4: VITE_API_URL (Add AFTER deployment)
- **Name**: `VITE_API_URL`
- **Value**: `https://performance-course-manager-production.up.railway.app`
- Click **"Add"**
- *This will trigger a rebuild with the correct API URL*

---

## Step 4: Configure Build Settings

### 4.1 Access Settings
1. Click **"Settings"** tab in your Railway project
2. Scroll to **"Build & Deploy"** section

### 4.2 Verify Build Commands
Railway should auto-detect, but verify:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `/` (leave empty or set to `/`)

### 4.3 If Settings Are Wrong
1. Click **"Edit"** next to each setting
2. Update to correct values:
   - Build Command: `npm run build`
   - Start Command: `npm start`
3. Click **"Save"**

---

## Step 5: Deploy Application

### 5.1 Automatic Deployment
- If you connected GitHub, Railway starts building automatically
- You'll see build progress in the **"Deployments"** tab

### 5.2 Manual Deployment (If Needed)
1. Click **"Deployments"** tab
2. Click **"Redeploy"** button (if available)
3. Or push a new commit to trigger deployment

### 5.3 Monitor Build Process
1. Click on the active deployment
2. Watch the build logs in real-time
3. You'll see:
   - `npm install` running
   - `npm run build` executing
   - Files being compiled
4. Wait for: **"Build successful"** message
5. Usually takes **2-5 minutes**

### 5.4 Check for Errors
If build fails:
- Check the error message in logs
- Common issues:
  - Missing environment variables
  - Build command errors
  - Dependency issues
- Fix errors and redeploy

---

## Step 6: Get Your Public URL

### 6.1 Access Domain Settings
1. Click **"Settings"** tab
2. Scroll down to **"Domains"** section

### 6.2 View Default Domain
- Railway provides: `performance-course-manager-production.up.railway.app`
- This is your production URL
- Copy this URL

### 6.3 Custom Domain (Optional)
1. Click **"Custom Domain"** button
2. Enter your domain name (e.g., `yourdomain.com`)
3. Railway will show DNS instructions:
   - Add a CNAME record
   - Point to: `performance-course-manager-production.up.railway.app`
4. Update your DNS settings
5. Wait for DNS propagation (5-30 minutes)

---

## Step 7: Update Frontend API URL

### 7.1 Go Back to Variables
1. Click **"Variables"** tab again

### 7.2 Add/Update VITE_API_URL
1. If not already added, click **"New Variable"**
2. **Name**: `VITE_API_URL`
3. **Value**: `https://performance-course-manager-production.up.railway.app`
4. Click **"Add"** or **"Update"**

### 7.3 Trigger Rebuild
- Adding this variable automatically triggers a new deployment
- Wait for rebuild to complete (2-5 minutes)
- This ensures frontend knows where to find the backend API

---

## Step 8: Verify Deployment

### 8.1 Test Your Website
1. Open browser
2. Go to: **https://performance-course-manager-production.up.railway.app**
3. You should see the login page with soccer theme

### 8.2 Test Student Login
1. Click **"👤 طالب"** tab
2. Enter a student phone number
3. Click **"دخول كطالب"**
4. Should redirect to student dashboard

### 8.3 Test Staff Login
1. Click **"🎓 فريق العمل"** tab
2. Try these accounts:

**Omar Samy (Teacher)**
- Username: `omar.samy`
- Password: `123`

**Abdelatif Reda (Teacher)**
- Username: `abdelatif.reda`
- Password: `123`

**Karim Ali (Teacher)**
- Username: `karim.ali`
- Password: `123`

**Admin**
- Username: `admin`
- Password: `123`

3. Should redirect to respective dashboard

### 8.4 Check Data Storage
1. After logging in, try to:
   - View students list
   - Add a new student
   - View dashboard stats
2. If data loads and persists, storage is working correctly

---

## Step 9: Monitor and Maintain

### 9.1 View Logs
1. Click **"Deployments"** tab
2. Click on any deployment
3. View **"Build Logs"** and **"Deploy Logs"**
4. Check for any errors or warnings

### 9.2 View Metrics
1. Click **"Metrics"** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

### 9.3 Set Up Monitoring (Optional)
1. Go to **"Settings"** → **"Notifications"**
2. Enable email alerts for:
   - Deployment failures
   - High resource usage
   - Service downtime

---

## Step 10: Automatic Deployments

### 10.1 How It Works
- Railway automatically deploys when you:
  - Push to your main/master branch
  - Merge a pull request
  - Make changes to connected branch

### 10.2 Deployment Process
1. Push code to GitHub
2. Railway detects the push
3. Automatically starts building
4. Deploys new version
5. Updates your live site

### 10.3 View Deployment History
1. Click **"Deployments"** tab
2. See all past deployments
3. Click any deployment to view details
4. Can rollback to previous version if needed

---

## Troubleshooting

### Build Fails
**Problem**: Build fails with errors

**Solutions**:
1. Check build logs for specific error
2. Verify all environment variables are set
3. Ensure `package.json` has all dependencies
4. Check Node.js version compatibility
5. Try redeploying

### Can't Access Website
**Problem**: Website shows error or won't load

**Solutions**:
1. Check Railway service status
2. Verify deployment was successful
3. Check domain settings
4. Review deployment logs
5. Try accessing via Railway's default domain

### Login Doesn't Work
**Problem**: Can't login with credentials

**Solutions**:
1. Check server logs in Railway dashboard
2. Ensure `VITE_API_URL` is set correctly
3. Test API endpoints directly
4. Verify data directory is writable
5. Check file permissions

### API Not Connecting
**Problem**: Frontend can't reach backend

**Solutions**:
1. Verify `VITE_API_URL` matches your Railway URL
2. Check CORS settings in server code
3. Ensure backend is running (check logs)
4. Test API endpoint: `https://performance-course-manager-production.up.railway.app/api/auth`
5. Check network tab in browser DevTools

---

## Quick Reference Checklist

Use this checklist to ensure everything is set up:

- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] Project created in Railway
- [ ] `NODE_ENV=production` set
- [ ] `PORT=3001` set
- [ ] `VITE_API_URL` set to Railway URL
- [ ] Build settings verified
- [ ] Deployment successful
- [ ] Website accessible
- [ ] Student login works
- [ ] Staff login works
- [ ] Data storage working
- [ ] All features functional

---

## Railway Dashboard Navigation

### Main Sections:
1. **Overview**: Project summary and quick stats
2. **Deployments**: View all deployments and logs
3. **Metrics**: CPU, memory, network usage
4. **Variables**: Environment variables
5. **Settings**: Project configuration
6. **Team**: Manage team members (if applicable)

### Important Buttons:
- **"Redeploy"**: Manually trigger new deployment
- **"View Logs"**: See real-time application logs
- **"Settings"**: Configure project settings
- **"New Variable"**: Add environment variable

---

## Support Resources

### Railway Documentation
- Official Docs: https://docs.railway.app
- Getting Started: https://docs.railway.app/guides/getting-started
- Environment Variables: https://docs.railway.app/develop/variables

### Railway Status
- Check service status: https://status.railway.app

### Need Help?
- Railway Discord: https://discord.gg/railway
- Railway Support: support@railway.app

---

## Your Deployment Summary

**Project Name**: performance-course-manager  
**Railway URL**: https://performance-course-manager-production.up.railway.app  
**Status**: ✅ Deployed (if successful)  
**Auto-Deploy**: ✅ Enabled (from GitHub)  

---

**Congratulations! Your app is now live on Railway! ⚽🚀**
