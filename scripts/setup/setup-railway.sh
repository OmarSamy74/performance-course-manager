#!/bin/bash

# Railway Setup Script
# Run this after logging in with: railway login

set -e

echo "🚂 Railway Setup Script"
echo "========================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo "✅ Railway CLI installed"
echo ""

# Navigate to project
cd "$(dirname "$0")"
echo "📁 Project directory: $(pwd)"
echo ""

# Check if logged in
echo "🔐 Checking Railway login status..."
if ! railway whoami &> /dev/null; then
    echo "⚠️  Not logged in. Please run: railway login"
    echo "   This will open your browser for authentication."
    exit 1
fi

echo "✅ Logged in to Railway"
echo ""

# Link to project (if not already linked)
echo "🔗 Linking to Railway project..."
if railway link --help &> /dev/null; then
    echo "   (Select your existing project from the list)"
    railway link || echo "   Project already linked or manual selection needed"
fi

echo ""

# Set environment variables
echo "⚙️  Setting environment variables..."

railway variables set NODE_ENV=production
echo "   ✅ NODE_ENV=production"

railway variables set VITE_API_URL=https://performance-course-manager-production.up.railway.app/api
echo "   ✅ VITE_API_URL set"

railway variables set AUTO_INIT_DB=true
echo "   ✅ AUTO_INIT_DB=true"

echo ""

# Initialize database
echo "🗄️  Initializing database..."
railway run npm run init-db:seed || echo "   ⚠️  Database init may have failed (check logs)"

echo ""

# Check status
echo "📊 Checking Railway status..."
railway status

echo ""

# Show recent logs
echo "📋 Recent deployment logs:"
railway logs --tail 30

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Check logs: railway logs --follow"
echo "   2. Verify deployment: railway status"
echo "   3. Test your domain: https://performance-course-manager-production.up.railway.app"
echo ""
