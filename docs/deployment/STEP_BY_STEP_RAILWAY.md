# Step-by-Step Railway Setup Guide

Follow these steps exactly to deploy your application to Railway.

## 📋 Prerequisites

- GitHub account
- Code pushed to GitHub repository
- No external services needed - uses Railway's file system

---

## Step 1: Create Railway Account

1. **Go to Railway**: Open [https://railway.app](https://railway.app) in your browser

2. **Sign Up**:
   - Click **"Start a New Project"** button
   - Choose one of these sign-up methods:
     - **GitHub** (Recommended - easiest for deployment)
     - **Google**
     - **Email**

3. **Authorize Railway** (if using GitHub):
   - Click "Continue with GitHub"
   - Authorize Railway to access your repositories
   - You'll be redirected to Railway dashboard

---

## Step 2: Create New Project

1. **Click "New Project"** button (top right or center of dashboard)

2. **Select Deployment Method**:
   - **Option A (Recommended)**: Click **"Deploy from GitHub repo"**
     - This connects your GitHub repository
     - Enables automatic deployments on push
   - **Option B**: Click **"Empty Project"** if you want to deploy manually

3. **If using GitHub**:
   - You'll see a list of your repositories
   - Find and select **`performance-course-manager`**
   - Click on it to select
   - Railway will automatically detect it's a Node.js project

---

## Step 3: Configure Environment Variables

1. **Navigate to Variables**:
   - In your Railway project dashboard
   - Click on your service (usually named after your repo)
   - Click the **"Variables"** tab at the top

2. **Add Required Variables**:
   
   Click **"New Variable"** for each:

   **Variable 1:**
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - Click **"Add"**

   **Variable 2:**
   - **Name**: `PORT`
   - **Value**: `3001`
   - Click **"Add"**

3. **Add Firebase Configuration** (Choose ONE method):

   **Method A: Service Account Key (Recommended)**
   
   1. Go to [Firebase Console](https://console.firebase.google.com)
   2. Select your project
   3. Click the gear icon ⚙️ → **Project Settings**
   4. Go to **"Service Accounts"** tab
   5. Click **"Generate new private key"**
   6. Download the JSON file
   7. Open the JSON file and copy ALL its contents
   8. In Railway:
      - **Name**: `FIREBASE_SERVICE_ACCOUNT_KEY`
      - **Value**: Paste the entire JSON content (as a single string)
      - Click **"Add"**

   **Method B: Project ID Only**
   
   1. Get your Firebase Project ID from Firebase Console
   2. In Railway:
      - **Name**: `FIREBASE_PROJECT_ID`
      - **Value**: `your-project-id-here`
      - Click **"Add"**

---

## Step 4: Configure Build Settings

1. **Go to Settings**:
   - Click **"Settings"** tab in your Railway project

2. **Verify Build Settings**:
   - Railway should auto-detect these, but verify:
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Root Directory**: `/` (leave empty or set to `/`)

3. **If settings are wrong**:
   - Click **"Edit"** next to each setting
   - Update to correct values
   - Click **"Save"**

---

## Step 5: Deploy

1. **Automatic Deployment**:
   - If you connected GitHub, Railway starts building automatically
   - You'll see build progress in the **"Deployments"** tab

2. **Manual Deployment** (if needed):
   - Click **"Deploy"** button
   - Railway will start the build process

3. **Monitor Build**:
   - Watch the build logs in real-time
   - Wait for "Build successful" message
   - Usually takes 2-5 minutes

4. **Check for Errors**:
   - If build fails, check the logs
   - Common issues:
     - Missing dependencies
     - Environment variables not set
     - Build command errors

---

## Step 6: Get Your Public URL

1. **After Successful Deployment**:
   - Go to **"Settings"** tab
   - Scroll down to **"Domains"** section

2. **Default Domain**:
   - Railway provides a default domain like:
     - `performance-course-manager-production.up.railway.app`
   - Copy this URL

3. **Custom Domain** (Optional):
   - Click **"Custom Domain"**
   - Enter your domain name
   - Follow DNS setup instructions

---

## Step 7: Update Frontend API URL

1. **Go Back to Variables**:
   - Click **"Variables"** tab again

2. **Add API URL**:
   - Click **"New Variable"**
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-app-name.up.railway.app`
     *(Replace with your actual Railway URL from Step 6)*
   - Click **"Add"**

3. **Trigger Rebuild**:
   - This will automatically trigger a new deployment
   - Wait for rebuild to complete

---

## Step 8: Verify Deployment

1. **Visit Your Website**:
   - Open your Railway URL in a browser
   - Example: `https://performance-course-manager-production.up.railway.app`

2. **Test Login**:
   - You should see the login page
   - Test with teacher accounts:

   **Omar Samy:**
   - Username: `omar.samy`
   - Password: `123`

   **Abdelatif Reda:**
   - Username: `abdelatif.reda`
   - Password: `123`

   **Karim Ali:**
   - Username: `karim.ali`
   - Password: `123`

3. **Verify Features**:
   - Login should work
   - Dashboard should load
   - Data storage should work (try adding a student)

---

## Step 9: Create Teacher Accounts (Automatic)

The teacher accounts are automatically created when you:
1. Login with the username/password
2. The system checks credentials and creates the user in local storage

**No manual setup needed!** Just login and the accounts are created automatically.

---

## Step 10: Final Verification

Check these items:

- [ ] Website is accessible
- [ ] Login page loads
- [ ] Can login with `omar.samy` / `123`
- [ ] Can login with `abdelatif.reda` / `123`
- [ ] Can login with `karim.ali` / `123`
- [ ] Dashboard loads after login
- [ ] No errors in Railway logs
- [ ] Firebase connection works

---

## 🎉 Success!

Your application is now deployed on Railway!

## 📝 Summary of Teacher Accounts

| Username | Password | Name |
|----------|----------|------|
| `omar.samy` | `123` | Omar Samy |
| `abdelatif.reda` | `123` | Abdelatif Reda |
| `karim.ali` | `123` | Karim Ali |

---

## 🆘 Troubleshooting

### Build Fails
- Check Railway build logs
- Verify all dependencies in `package.json`
- Ensure environment variables are set

### Can't Login
- Check Railway runtime logs
- Verify Firebase credentials
- Ensure user accounts are created

### API Not Working
- Verify `VITE_API_URL` is set correctly
- Check that backend is running
- Review Railway logs for errors

### Need Help?
- Check Railway documentation: https://docs.railway.app
- Review deployment logs in Railway dashboard
- Verify all environment variables are correct

---

## 🔄 Future Deployments

After initial setup:
- **Automatic**: Push to GitHub → Railway auto-deploys
- **Manual**: Click "Redeploy" in Railway dashboard

---

**Congratulations! Your app is live on Railway! 🚀**
