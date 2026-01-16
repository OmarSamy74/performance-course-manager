# 🔐 Teacher Account Passwords

## ⚠️ Important Security Notice

All teacher accounts now use **complex passwords** (12 characters with uppercase, lowercase, numbers, and symbols).

## 📋 Teacher Accounts

All teachers are assigned to the same course: **SOCCER ANALYTICS PRO - PERFORMANCE MASTERY**

### Teacher Accounts:

1. **Omar Samy**
   - Username: `omar.samy`
   - Password: Generated complex password (see below)
   - Course: `soccer-analytics-pro-performance-mastery`

2. **Abdelatif Reda**
   - Username: `abdelatif.reda`
   - Password: Generated complex password (see below)
   - Course: `soccer-analytics-pro-performance-mastery`

3. **Karim Ali**
   - Username: `karim.ali`
   - Password: Generated complex password (see below)
   - Course: `soccer-analytics-pro-performance-mastery`

4. **Default Teacher**
   - Username: `teacher`
   - Password: Generated complex password (see below)
   - Course: `soccer-analytics-pro-performance-mastery`

## 🔑 Getting Passwords

Passwords are generated when you run the database initialization script:

```bash
npm run init-db:pg
```

The script will display all teacher passwords in the console output. **SAVE THESE PASSWORDS SECURELY!**

Example output:
```
📋 Teacher Passwords (SAVE THESE SECURELY):
==========================================
omar.samy: Kx9#mP2$vL8@
abdelatif.reda: Qw3!nR7&tY5#
karim.ali: Zp4@bN9%uM1*
teacher: Hj6$cV2^fX8!
==========================================
```

## 🔄 Resetting Passwords

To reset passwords, you can:

1. **Re-run initialization** (will generate new passwords):
   ```bash
   # Drop and recreate users table
   # Then run: npm run init-db:pg
   ```

2. **Update manually in database**:
   ```sql
   UPDATE users 
   SET password = '$2a$10$...' -- bcrypt hash
   WHERE username = 'omar.samy';
   ```

## 📝 Password Requirements

- **Length**: 12 characters minimum
- **Contains**: 
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 symbol (!@#$%^&*)
- **Storage**: Passwords are hashed using bcrypt (10 rounds)

## 🔒 Security Best Practices

1. **Never commit passwords to git**
2. **Store passwords securely** (password manager)
3. **Share passwords securely** (encrypted channels)
4. **Change passwords regularly** in production
5. **Use environment variables** for sensitive data

## 🎓 Course Assignment

All teachers are automatically assigned to the same course:
- **Course ID**: `soccer-analytics-pro-performance-mastery`
- **Course Name**: SOCCER ANALYTICS PRO - PERFORMANCE MASTERY

This ensures all teachers work with the same course content, students, and materials.
