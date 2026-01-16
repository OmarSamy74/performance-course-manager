# 🔐 Quick Guide: Update Passwords in PostgreSQL

## Step 1: Get DATABASE_URL from Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Click on your **PostgreSQL** service
4. Go to **Variables** tab
5. Find `DATABASE_URL` and copy its value

## Step 2: Run the Update Script

### Option A: Using Environment Variable (Recommended)

```bash
DATABASE_URL="postgresql://user:password@host:port/database" npm run update-passwords:pg
```

### Option B: Export First, Then Run

```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
npm run update-passwords:pg
```

### Option C: Create .env file (for local development)

Create a `.env` file in the project root:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

Then run:
```bash
npm run update-passwords:pg
```

## Step 3: Save the Passwords

The script will output all new passwords. **SAVE THEM IMMEDIATELY** - they cannot be recovered!

Example output:
```
============================================================
📋 Updated Passwords (SAVE THESE SECURELY):
============================================================
admin: Kx9#mP2$vL8@
omar.samy: Qw3!nR7&tY5#
abdelatif.reda: Zp4@bN9%uM1*
karim.ali: Hj6$cV2^fX8!
teacher: Mq5&wX3#nB7!
============================================================
```

## ⚠️ Important Notes

- Passwords are **12 characters** long
- Include: uppercase, lowercase, numbers, and symbols
- **Cannot be recovered** if lost - save them immediately!
- All users in the database will get new passwords

## 🔧 Troubleshooting

### Error: "DATABASE_URL environment variable is required"
- Make sure you've set DATABASE_URL before running the script
- Check that the URL is correct and complete

### Error: "ECONNREFUSED"
- Verify DATABASE_URL is correct
- Check that Railway PostgreSQL service is running
- Ensure your IP is allowed (if using IP restrictions)

### Error: "No users found in database"
- Database is empty or users table doesn't exist
- Run `npm run init-db:pg` first to initialize the database

## 📚 Alternative: Use Admin API

You can also update passwords via the Admin API endpoint:

```bash
POST /api/users/update-passwords
Authorization: Bearer YOUR_ADMIN_TOKEN
```

See [USER_PASSWORD_MANAGEMENT.md](./USER_PASSWORD_MANAGEMENT.md) for details.
