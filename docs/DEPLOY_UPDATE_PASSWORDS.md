# 🚀 Auto-Update Passwords on Deploy

## Overview

This guide explains how to automatically update user passwords during Railway deployment.

## 🔧 Setup

### Step 1: Add Environment Variable in Railway

1. Go to Railway Dashboard
2. Select your project
3. Go to **Variables** tab
4. Add new variable:
   - **Name**: `UPDATE_PASSWORDS_ON_DEPLOY`
   - **Value**: `true`
5. Save

### Step 2: Deploy

On the next deployment, passwords will be automatically updated.

## 📋 How It Works

1. During server startup, if `UPDATE_PASSWORDS_ON_DEPLOY=true`:
   - Connects to PostgreSQL
   - Updates all user passwords
   - Logs new passwords to Railway logs
   - Continues deployment (won't fail if password update fails)

2. **Get Passwords from Railway Logs**:
   - Go to Railway Dashboard
   - Select your service
   - Click **"Logs"** tab
   - Look for section: `📋 [Deploy] NEW PASSWORDS`
   - Copy all passwords

## ⚠️ Important Notes

- **Passwords are logged to Railway logs** - check them immediately after deploy
- **Save passwords immediately** - they cannot be recovered
- **All users get new passwords** on each deploy (if enabled)
- **Deployment won't fail** if password update fails (non-blocking)

## 🔄 Disable Auto-Update

To disable automatic password updates:

1. Go to Railway Variables
2. Set `UPDATE_PASSWORDS_ON_DEPLOY` to `false` or remove it
3. Redeploy

## 📝 Example Log Output

```
🔐 [Deploy] Updating user passwords...
✅ [Deploy] Connected to database
📋 [Deploy] Found 5 user(s)
✅ [Deploy] Updated: admin
✅ [Deploy] Updated: omar.samy
...

============================================================
📋 [Deploy] NEW PASSWORDS (SAVE FROM RAILWAY LOGS):
============================================================
admin: Kx9#mP2$vL8@
omar.samy: Qw3!nR7&tY5#
...
============================================================
⚠️  [Deploy] IMPORTANT: Copy these passwords from Railway logs!
```

## 🛠️ Manual Trigger

You can also trigger password update manually via Railway CLI:

```bash
railway run npm run deploy:update-passwords
```

## 🔒 Security

- Passwords are only logged during deployment
- Railway logs are private to your account
- Consider removing `UPDATE_PASSWORDS_ON_DEPLOY` after getting passwords
- Use Railway's log retention settings

## 📚 Related

- [Update Passwords Commands](./UPDATE_PASSWORDS_CMD.md)
- [User Password Management](./USER_PASSWORD_MANAGEMENT.md)
