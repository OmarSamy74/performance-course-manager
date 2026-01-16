# 🔐 How to Use Password System

## 📋 Quick Guide

### Step 1: Edit Passwords in MD File

Open `docs/USER_PASSWORDS.md` and edit the passwords:

```markdown
### Admin
- **Username**: `admin`
- **Password**: `YourPasswordHere`  ← Edit this
- **Role**: ADMIN

### Teachers

#### Omar Samy
- **Username**: `omar.samy`
- **Password**: `YourPasswordHere`  ← Edit this
- **Role**: TEACHER
```

### Step 2: Set Railway Variable

1. Go to Railway Dashboard
2. Your Project → Variables
3. Add: `RESET_USERS_ON_DEPLOY` = `true`
4. Save

### Step 3: Deploy

Push to GitHub or trigger deploy. The system will:
- Delete all existing users
- Create new users with passwords from MD file
- Show passwords in Railway Logs

### Step 4: Get Passwords from Logs

1. Railway Dashboard → Your Service → **Logs** tab
2. Look for:
   ```
   ======================================================================
   📋 [Deploy] USER PASSWORDS (from USER_PASSWORDS.md):
   ======================================================================
   admin                (Administrator          ) : Admin@2024!Secure
   omar.samy            (Omar Samy              ) : Omar@2024!Secure
   ...
   ======================================================================
   ```
3. Copy all passwords

## 🎯 Current Passwords (from USER_PASSWORDS.md)

After next deploy, these will be the passwords:

- **admin**: `Admin@2024!Secure`
- **omar.samy**: `Omar@2024!Secure`
- **abdelatif.reda**: `Abdelatif@2024!Secure`
- **karim.ali**: `Karim@2024!Secure`
- **teacher**: `Teacher@2024!Secure`
- **sales**: `Sales@2024!Secure`

## ⚠️ Important

- Edit `docs/USER_PASSWORDS.md` with your desired passwords
- Set `RESET_USERS_ON_DEPLOY=true` in Railway
- Deploy to apply changes
- Get passwords from Railway Logs after deploy

## 🔄 To Change Passwords

1. Edit `docs/USER_PASSWORDS.md`
2. Deploy (if `RESET_USERS_ON_DEPLOY=true` is set)
3. Get new passwords from Railway Logs
