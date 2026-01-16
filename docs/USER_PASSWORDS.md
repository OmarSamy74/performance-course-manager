# 🔐 User Passwords

## ⚠️ Important
**DO NOT COMMIT THIS FILE TO GIT** - Contains sensitive passwords!

Add to `.gitignore`:
```
docs/USER_PASSWORDS.md
```

## 📋 User Accounts and Passwords

### Admin
- **Username**: `admin`
- **Password**: `Admin@2024!Secure`
- **Role**: ADMIN

### Teachers

#### Omar Samy
- **Username**: `omar.samy`
- **Password**: `Omar@2024!Secure`
- **Role**: TEACHER
- **Course**: soccer-analytics-pro-performance-mastery

#### Abdelatif Reda
- **Username**: `abdelatif.reda`
- **Password**: `Abdelatif@2024!Secure`
- **Role**: TEACHER
- **Course**: soccer-analytics-pro-performance-mastery

#### Karim Ali
- **Username**: `karim.ali`
- **Password**: `Karim@2024!Secure`
- **Role**: TEACHER
- **Course**: soccer-analytics-pro-performance-mastery

#### Default Teacher
- **Username**: `teacher`
- **Password**: `Teacher@2024!Secure`
- **Role**: TEACHER
- **Course**: soccer-analytics-pro-performance-mastery

### Sales
- **Username**: `sales`
- **Password**: `Sales@2024!Secure`
- **Role**: SALES

## 🔄 How to Update

1. Edit this file with new passwords
2. Set `RESET_USERS_ON_DEPLOY=true` in Railway Variables
3. Deploy - users will be reset with passwords from this file

## 📝 Format

Each user entry should be:
```markdown
- **Username**: `username`
- **Password**: `password`
- **Role**: ROLE
- **Course**: course-id (optional, for teachers)
```
