# 🔐 Update Passwords - Quick Commands

## 🚀 Method 1: Using Railway CLI (Automatic)

If you have Railway CLI installed and logged in:

```bash
npm run update-passwords:railway
```

**What it does:**
- Automatically gets DATABASE_URL from Railway
- Runs the password update script
- Shows all new passwords

**Requirements:**
- Railway CLI installed: `npm install -g @railway/cli`
- Logged in: `railway login`
- Project linked: `railway link` (optional, will prompt if needed)

## 📝 Method 2: Manual Input (Interactive)

Prompts you to enter DATABASE_URL:

```bash
npm run update-passwords:manual
```

**What it does:**
- Prompts for DATABASE_URL
- Validates the URL
- Runs the password update script

## 🔧 Method 3: Direct Command (With DATABASE_URL)

If you already have the DATABASE_URL:

```bash
DATABASE_URL="postgresql://..." npm run update-passwords:pg
```

## 📋 Method 4: Using Railway CLI Directly

```bash
# Get DATABASE_URL and run in one command
railway variables | grep DATABASE_URL | awk '{print $2}' | xargs -I {} sh -c 'DATABASE_URL="{}" npm run update-passwords:pg'
```

## 🎯 Recommended Workflow

### First Time Setup:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link to your project (optional)
railway link

# 4. Update passwords
npm run update-passwords:railway
```

### Quick Update (After Setup):

```bash
npm run update-passwords:railway
```

## ⚠️ Important Notes

1. **Save Passwords Immediately**: The script displays all new passwords. Save them right away - they cannot be recovered!

2. **Public URL Required**: If you get an error about `.railway.internal`, you need the public DATABASE_URL:
   - Go to Railway Dashboard → PostgreSQL → Connect tab
   - Copy the PUBLIC connection string

3. **All Users Updated**: This updates passwords for ALL users in the database

## 🔍 Troubleshooting

### "Railway CLI is not installed"
```bash
npm install -g @railway/cli
```

### "Not logged in to Railway"
```bash
railway login
```

### "Could not get DATABASE_URL"
- Make sure you're in the correct project
- Try: `railway link` to link to your project
- Or use manual method: `npm run update-passwords:manual`

### "ENOTFOUND postgres.railway.internal"
- You're using an internal URL
- Get the PUBLIC URL from Railway Dashboard → PostgreSQL → Connect tab
- Use manual method: `npm run update-passwords:manual`

## 📚 Related Documentation

- [Quick Update Passwords Guide](./QUICK_UPDATE_PASSWORDS.md)
- [Railway DATABASE_URL Guide](./RAILWAY_DATABASE_URL.md)
- [User Password Management](./USER_PASSWORD_MANAGEMENT.md)
