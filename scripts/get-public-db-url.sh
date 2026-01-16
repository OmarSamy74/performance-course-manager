#!/bin/bash
# Get public DATABASE_URL from Railway PostgreSQL service

set -e

echo "🔍 Getting Public DATABASE_URL from Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed"
    echo "   Install: npm install -g @railway/cli"
    exit 1
fi

# Get service info
echo "📡 Fetching PostgreSQL service information..."

# Try to get public connection info
# Railway stores public connection in service variables or connection info
PUBLIC_URL=$(railway variables --json 2>/dev/null | jq -r '.["DATABASE_URL_PUBLIC"] // empty' 2>/dev/null)

if [ -z "$PUBLIC_URL" ] || [ "$PUBLIC_URL" == "null" ]; then
    echo ""
    echo "⚠️  Public DATABASE_URL not found in Railway variables"
    echo ""
    echo "📋 To get the PUBLIC DATABASE_URL manually:"
    echo ""
    echo "   1. Go to Railway Dashboard: https://railway.app"
    echo "   2. Select your project"
    echo "   3. Click on PostgreSQL service"
    echo "   4. Click 'Connect' or 'Connection' tab"
    echo "   5. Look for 'Public Network' section"
    echo "   6. Copy the connection string"
    echo ""
    echo "   The public URL should look like:"
    echo "   postgresql://postgres:password@xxxxx.railway.app:5432/railway"
    echo ""
    echo "   (NOT postgres.railway.internal)"
    echo ""
    exit 1
fi

echo "✅ Found Public DATABASE_URL:"
echo ""
echo "$PUBLIC_URL"
echo ""
echo "💡 To use it:"
echo "   DATABASE_URL=\"$PUBLIC_URL\" npm run update-passwords:pg"
echo ""
