# 🔐 Update Passwords - Command Line Methods

## 🚀 Method 1: Simple Node.js Script (Recommended)

Uses plain Node.js (no TypeScript compilation):

```bash
DATABASE_URL="postgresql://postgres:password@host:port/database" npm run update-passwords:simple
```

Or directly:
```bash
DATABASE_URL="postgresql://postgres:password@host:port/database" node scripts/update-passwords-simple.js
```

**Advantages:**
- ✅ No TypeScript compilation needed
- ✅ Faster execution
- ✅ Better error messages
- ✅ 15 second timeout

## 📝 Method 2: TypeScript Script

```bash
DATABASE_URL="postgresql://..." npm run update-passwords:pg
```

## 🔧 Method 3: Using Railway CLI

```bash
npm run update-passwords:railway
```

## 💬 Method 4: Interactive Manual

```bash
npm run update-passwords:manual
```

## 📋 Quick Example

```bash
# Get your DATABASE_URL from Railway Dashboard
# Then run:

DATABASE_URL="postgresql://postgres:TCAhdAAaXAiTLppgnOGDhjLKshxnerBI@nozomi.proxy.rlwy.net:23007/railway" npm run update-passwords:simple
```

## 🎯 Recommended: Simple Node.js Method

For fastest and most reliable execution:

```bash
DATABASE_URL="your-url-here" npm run update-passwords:simple
```

## ⚠️ Important

- Save passwords immediately - they cannot be recovered!
- Use PUBLIC DATABASE_URL (not .railway.internal)
- All users will get new passwords

## 🔍 Troubleshooting

### "Connection timeout"
- Check internet connection
- Verify DATABASE_URL is correct
- Try again in a few moments

### "ENOTFOUND" or "ECONNREFUSED"
- Use PUBLIC URL (not .railway.internal)
- Check Railway PostgreSQL is running
- Verify hostname in DATABASE_URL
