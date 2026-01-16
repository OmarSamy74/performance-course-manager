# 🔐 User Password Management

## Overview

This document explains how to update user passwords in PostgreSQL and how admins can extract all users with their password information.

## 📋 Features

1. **Script to Update All Passwords**: Command-line script to update all user passwords in the database
2. **Admin API Endpoints**: REST API endpoints for admins to:
   - List all users with password hashes
   - Update all user passwords and get new passwords

## 🛠️ Method 1: Using Command-Line Script

### Update All User Passwords

Run the script to update all user passwords in PostgreSQL:

```bash
npm run update-passwords:pg
```

Or with explicit DATABASE_URL:

```bash
DATABASE_URL="postgresql://user:pass@host:port/db" npm run update-passwords:pg
```

**What it does:**
- Connects to PostgreSQL database
- Generates new complex passwords (12 characters) for all users
- Updates passwords in the database (stored as bcrypt hashes)
- Displays all new passwords in the console

**Example Output:**
```
🔐 Connecting to database...
📋 Found 5 user(s) to update

✅ Updated password for: admin (ADMIN)
✅ Updated password for: omar.samy (TEACHER)
✅ Updated password for: abdelatif.reda (TEACHER)
✅ Updated password for: karim.ali (TEACHER)
✅ Updated password for: teacher (TEACHER)

============================================================
📋 Updated Passwords (SAVE THESE SECURELY):
============================================================
admin: Kx9#mP2$vL8@
omar.samy: Qw3!nR7&tY5#
abdelatif.reda: Zp4@bN9%uM1*
karim.ali: Hj6$cV2^fX8!
teacher: Mq5&wX3#nB7!
============================================================

⚠️  IMPORTANT: Save these passwords securely!
   They cannot be recovered if lost.
```

## 🌐 Method 2: Using Admin API Endpoints

### Prerequisites

- You must be logged in as an **ADMIN** user
- Your session token must be included in the Authorization header

### 1. List All Users with Passwords

**Endpoint:** `GET /api/users`

**Request:**
```bash
curl -X GET https://your-domain.com/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "users": [
    {
      "id": "uuid-here",
      "username": "admin",
      "password": "$2a$10$...",  // bcrypt hash
      "role": "ADMIN",
      "studentId": null,
      "courseId": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    // ... more users
  ],
  "count": 5,
  "note": "Passwords are stored as bcrypt hashes. Use POST /api/users/update-passwords to generate new passwords."
}
```

### 2. Update All User Passwords

**Endpoint:** `POST /api/users/update-passwords`

**Request:**
```bash
curl -X POST https://your-domain.com/api/users/update-passwords \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Successfully updated passwords for 5 user(s)",
  "passwords": {
    "admin": "Kx9#mP2$vL8@",
    "omar.samy": "Qw3!nR7&tY5#",
    "abdelatif.reda": "Zp4@bN9%uM1*",
    "karim.ali": "Hj6$cV2^fX8!",
    "teacher": "Mq5&wX3#nB7!"
  },
  "warning": "Save these passwords securely! They cannot be recovered if lost."
}
```

## 💻 Using from Frontend (React)

### List All Users

```typescript
import { usersApi } from './api/client';

// Get all users with passwords
const response = await usersApi.list();
console.log(response.users); // Array of users with password hashes
console.log(response.count); // Number of users
```

### Update All Passwords

```typescript
import { usersApi } from './api/client';

// Update all passwords and get new passwords
const response = await usersApi.updatePasswords();
console.log(response.passwords); // Object mapping username to new password
console.log(response.message); // Success message
console.log(response.warning); // Security warning
```

## 🔒 Security Notes

1. **Password Storage**: Passwords are stored as bcrypt hashes (one-way encryption). Original passwords cannot be recovered.

2. **Admin Only**: These endpoints are restricted to ADMIN users only. Unauthorized access will return 403 Forbidden.

3. **Save Passwords**: When passwords are updated, save them securely immediately. They cannot be recovered if lost.

4. **Password Complexity**: Generated passwords are 12 characters long and include:
   - Uppercase letters (A-Z)
   - Lowercase letters (a-z)
   - Numbers (0-9)
   - Symbols (!@#$%^&*)

5. **Production Use**: In production, consider:
   - Using environment variables for sensitive operations
   - Logging password updates for audit trails
   - Implementing rate limiting on password update endpoints
   - Using secure channels (HTTPS) for all API calls

## 📝 Password Format

Generated passwords follow this format:
- **Length**: 12 characters
- **Contains**: At least 1 uppercase, 1 lowercase, 1 number, 1 symbol
- **Example**: `Kx9#mP2$vL8@`

## 🚨 Important Warnings

- ⚠️ **Passwords cannot be recovered**: Once updated, old passwords are lost forever
- ⚠️ **Save immediately**: Copy and save new passwords as soon as they're generated
- ⚠️ **Admin access only**: Only ADMIN role can access these endpoints
- ⚠️ **Production security**: Ensure proper authentication and authorization in production

## 🔧 Troubleshooting

### Script fails to connect
- Check `DATABASE_URL` environment variable
- Verify PostgreSQL is running and accessible
- Check network connectivity

### API returns 403 Forbidden
- Ensure you're logged in as ADMIN user
- Check your session token is valid
- Verify your user role is ADMIN

### Passwords not updating
- Check database connection
- Verify user exists in database
- Check server logs for errors

## 📚 Related Documentation

- [Teacher Passwords](./TEACHER_PASSWORDS.md) - Information about teacher account passwords
- [Database Setup](./database/POSTGRESQL_SETUP.md) - PostgreSQL setup guide
- [API Documentation](./API.md) - Full API documentation
