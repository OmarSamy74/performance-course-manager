#!/bin/bash
# Update all user passwords in PostgreSQL using Railway
# This script automatically gets DATABASE_URL from Railway CLI

set -e

echo "🔐 Updating user passwords in PostgreSQL..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed"
    echo ""
    echo "📦 Install it with:"
    echo "   npm install -g @railway/cli"
    echo ""
    echo "🔐 Or login to Railway:"
    echo "   railway login"
    echo ""
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway"
    echo ""
    echo "🔐 Please login:"
    echo "   railway login"
    echo ""
    exit 1
fi

# Get DATABASE_URL from Railway
echo "📡 Getting DATABASE_URL from Railway..."

# Try to get DATABASE_URL using JSON (more reliable)
if command -v jq &> /dev/null; then
    export DATABASE_URL=$(railway variables --json 2>/dev/null | jq -r '.DATABASE_URL // empty')
else
    # Fallback: parse from table format
    export DATABASE_URL=$(railway variables 2>/dev/null | grep -A 3 "DATABASE_URL" | grep -v "DATABASE_URL" | tr -d '│' | tr -d ' ' | tr '\n' '' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
fi

if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" == "null" ]; then
    echo "❌ Could not get DATABASE_URL from Railway"
    echo ""
    echo "💡 Try manually:"
    echo "   1. Go to Railway Dashboard"
    echo "   2. Select your PostgreSQL service"
    echo "   3. Go to Variables tab"
    echo "   4. Copy DATABASE_URL"
    echo "   5. Run: DATABASE_URL=\"your-url\" npm run update-passwords:pg"
    echo ""
    exit 1
fi

# Check if it's internal URL (won't work)
if [[ "$DATABASE_URL" == *".railway.internal"* ]]; then
    echo "⚠️  Internal URL detected: $DATABASE_URL"
    echo ""
    echo "❌ This URL won't work from your local machine"
    echo ""
    echo "💡 You need the PUBLIC DATABASE_URL:"
    echo ""
    echo "   Option 1: Get from Railway Dashboard"
    echo "   1. Go to Railway Dashboard → Your Project"
    echo "   2. Click on PostgreSQL service"
    echo "   3. Click 'Connect' or 'Connection' tab"
    echo "   4. Look for 'Public Network' connection"
    echo "   5. Copy the connection string (should have .railway.app, not .railway.internal)"
    echo ""
    echo "   Option 2: Use manual script"
    echo "   npm run update-passwords:manual"
    echo ""
    echo "   Option 3: Get public URL from Railway CLI"
    echo "   railway connect postgres"
    echo "   (Then copy the public connection string shown)"
    echo ""
    exit 1
fi

echo "✅ Got DATABASE_URL: ${DATABASE_URL:0:50}..."

echo "✅ Got DATABASE_URL"
echo ""

# Run the update script
npm run update-passwords:pg
