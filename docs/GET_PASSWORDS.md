# 🔐 How to Get User Passwords

## ⚠️ Important

**Passwords cannot be retrieved** - they are stored as bcrypt hashes (one-way encryption). You can only:
1. **Generate new passwords** and get them
2. **View password hashes** (not useful for login)

## 🚀 Method 1: Via Admin API (Easiest)

### Step 1: Login as Admin

1. Go to your website
2. Login as admin user
3. Open browser DevTools (F12)
4. Go to **Network** tab
5. Look for any API request
6. Check **Authorization** header: `Bearer YOUR_TOKEN`
7. Copy the token (without `Bearer `)

### Step 2: Run Script

```bash
npm run get-passwords:api
```

Enter your admin token when prompted. The script will:
- Update all passwords
- Display new passwords immediately

## 🌐 Method 2: Via Railway Deploy

### Setup:

1. Add to Railway Variables:
   - `UPDATE_PASSWORDS_ON_DEPLOY=true`

2. Deploy your app

3. Get passwords from Railway Logs:
   - Railway Dashboard → Your Service → **Logs** tab
   - Look for: `📋 [Deploy] NEW PASSWORDS`
   - Copy all passwords

## 📝 Method 3: Manual API Call

If you have admin token:

```bash
curl -X POST "https://your-domain.com/api/users/update-passwords" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

Response will include all new passwords.

## 🔧 Method 4: Railway CLI

```bash
# Update passwords on Railway
railway run npm run deploy:update-passwords

# Then check logs
railway logs
```

## 📋 Method 5: View Password Hashes (Admin Only)

To see password hashes (not actual passwords):

```bash
curl "https://your-domain.com/api/users" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

This shows bcrypt hashes - **cannot be used for login**.

## ⚠️ Security Notes

- **Save passwords immediately** - they cannot be recovered
- **Passwords are logged** - check Railway logs or API response
- **All users get new passwords** when updated
- **Admin access required** for all methods

## 🎯 Recommended: Admin API Method

The easiest way is using the admin API:

```bash
npm run get-passwords:api
```

Just need to:
1. Login as admin in browser
2. Get token from DevTools
3. Run script
4. Get passwords immediately

## 📚 Related

- [Update Passwords Commands](./UPDATE_PASSWORDS_CMD.md)
- [Deploy Update Passwords](./DEPLOY_UPDATE_PASSWORDS.md)
- [User Password Management](./USER_PASSWORD_MANAGEMENT.md)
