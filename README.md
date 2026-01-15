<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Performance Course Manager

A comprehensive course management system built with React, Express, and file-based storage.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (optional):
   - Create a `.env.local` file for frontend variables
   - No backend configuration needed - uses file-based storage

3. Run the development servers:
   ```bash
   # Run both frontend and backend concurrently
   npm run dev:all
   
   # Or run them separately:
   npm run dev          # Frontend (Vite)
   npm run dev:server   # Backend (Express)
   ```

4. Access the app:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Deploy to Railway

📖 **For detailed step-by-step instructions, see:**
- [RAILWAY_QUICK_START.md](./RAILWAY_QUICK_START.md) - Quick setup guide
- [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) - Comprehensive deployment guide

### Quick Steps:
1. Connect your repository to Railway
2. Railway will automatically detect the project and use the `Procfile`
3. Set environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `PORT` (automatically set by Railway)
   - `VITE_API_URL` (your Railway public URL)
4. Data is stored in JSON files on Railway's persistent file system

The app will be automatically deployed and available at your Railway domain.

## 👥 Pre-configured Teacher Accounts

The following teacher accounts are ready to use:

| Username | Password | Name |
|----------|----------|------|
| `omar.samy` | `123` | Omar Samy |
| `abdelatif.reda` | `123` | Abdelatif Reda |
| `karim.ali` | `123` | Karim Ali |

### Other Accounts:
- **Admin**: `admin` / `123`
- **Default Teacher**: `teacher` / `123`
- **Sales**: `sales` / `123`
