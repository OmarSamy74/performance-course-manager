# Railway Deployment Guide - Step by Step

## Step 1: Create Railway Account

1. Go to [https://railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"** if you already have an account
3. Sign up using:
   - GitHub (recommended)
   - Google
   - Email

## Step 2: Create New Project

1. After logging in, click **"New Project"**
2. Select **"Deploy from GitHub repo"** (recommended) or **"Empty Project"**
3. If using GitHub:
   - Authorize Railway to access your repositories
   - Select the `performance-course-manager` repository
   - Railway will automatically detect the project

## Step 3: Configure Environment Variables

1. In your Railway project dashboard, click on your service
2. Go to the **"Variables"** tab
3. Click **"New Variable"** and add the following:

### Required Variables:

```
NODE_ENV=production
PORT=3001
```

### Frontend API URL (After deployment):
Once Railway gives you a public URL, add:
```
VITE_API_URL=https://your-app-name.up.railway.app
```

## Step 4: Configure Build Settings

1. Railway should auto-detect your project
2. If not, go to **Settings** → **Build & Deploy**
3. Ensure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `/` (root)

## Step 5: Deploy

1. Railway will automatically start building when you:
   - Push to your connected GitHub branch, OR
   - Click **"Deploy"** in the Railway dashboard
2. Watch the build logs in the **"Deployments"** tab
3. Wait for deployment to complete (usually 2-5 minutes)

## Step 6: Get Your Public URL

1. After successful deployment, go to **Settings**
2. Scroll to **"Domains"** section
3. Railway provides a default domain like: `your-app-name.up.railway.app`
4. You can also add a custom domain if needed

## Step 7: Update Frontend API URL

1. Go back to **Variables** tab
2. Add/Update:
   ```
   VITE_API_URL=https://your-app-name.up.railway.app
   ```
3. This will trigger a rebuild with the correct API URL

## Step 8: Verify Deployment

1. Visit your Railway URL: `https://your-app-name.up.railway.app`
2. Test the login with one of the teacher accounts:
   - Username: `omar.samy` / Password: `123`
   - Username: `abdelatif.reda` / Password: `123`
   - Username: `karim.ali` / Password: `123`

## Step 9: Set Up Custom Domain (Optional)

1. In Railway dashboard → **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter your domain name
4. Follow Railway's DNS instructions to point your domain to Railway

## Troubleshooting

### Build Fails
- Check build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### API Not Working
- Check that `VITE_API_URL` is set correctly
- Verify data directory permissions
- Check Railway logs for errors

### Can't Login
- Check that user accounts are being created
- Verify data storage is working
- Review server logs in Railway dashboard

## Monitoring

- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Check CPU, Memory, and Network usage
- **Deployments**: View deployment history and rollback if needed

## Next Steps

After successful deployment:
1. Test all features
2. Set up monitoring alerts
3. Configure backups for data directory (optional - Railway volumes)
4. Set up CI/CD for automatic deployments
