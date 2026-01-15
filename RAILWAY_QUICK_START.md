# Railway Quick Start Guide

## 🚀 Quick Deployment Steps

### 1. Sign Up / Login to Railway
- Visit: https://railway.app
- Click "Start a New Project"
- Sign in with GitHub (recommended)

### 2. Connect Your Repository
- Click "Deploy from GitHub repo"
- Authorize Railway → Select your repository
- Railway auto-detects the project

### 3. Add Environment Variables
Go to **Variables** tab and add:

```
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
```
*(Or use FIREBASE_SERVICE_ACCOUNT_KEY instead)*

### 4. Deploy
- Railway automatically starts building
- Wait 2-5 minutes for deployment
- Get your URL from Settings → Domains

### 5. Update API URL
After getting your Railway URL, add to Variables:
```
VITE_API_URL=https://your-app.up.railway.app
```
This triggers a rebuild.

### 6. Test Login
Visit your Railway URL and login with:
- **Omar Samy**: `omar.samy` / `123`
- **Abdelatif Reda**: `abdelatif.reda` / `123`
- **Karim Ali**: `karim.ali` / `123`

## 📋 Teacher Accounts Created

The following teacher accounts are pre-configured:

| Username | Password | Name |
|----------|----------|------|
| `omar.samy` | `123` | Omar Samy |
| `abdelatif.reda` | `123` | Abdelatif Reda |
| `karim.ali` | `123` | Karim Ali |

## 🔧 Firebase Setup

### Option 1: Service Account Key (Recommended)
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Copy the JSON content
4. In Railway Variables, add:
   ```
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```
   *(Paste entire JSON as a string)*

### Option 2: Project ID Only
1. Get your Firebase Project ID from Firebase Console
2. In Railway Variables, add:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   ```

## ✅ Verification Checklist

- [ ] Railway project created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Public URL obtained
- [ ] VITE_API_URL updated
- [ ] Can login with teacher accounts
- [ ] Data storage working

## 🆘 Need Help?

- Check Railway logs in the dashboard
- Verify data directory permissions
- Ensure all environment variables are set
- Review deployment logs for errors
