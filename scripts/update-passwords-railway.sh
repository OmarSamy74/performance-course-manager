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
export DATABASE_URL=$(railway variables --json | jq -r '.[] | select(.name == "DATABASE_URL") | .value' 2>/dev/null || railway variables | grep DATABASE_URL | awk '{print $2}')

if [ -z "$DATABASE_URL" ]; then
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
    echo "⚠️  Warning: Internal URL detected (won't work from local machine)"
    echo ""
    echo "💡 You need the PUBLIC DATABASE_URL:"
    echo "   1. Go to Railway Dashboard"
    echo "   2. Select PostgreSQL service"
    echo "   3. Go to 'Connect' or 'Connection' tab"
    echo "   4. Copy the PUBLIC connection string"
    echo "   5. Run: DATABASE_URL=\"public-url\" npm run update-passwords:pg"
    echo ""
    exit 1
fi

echo "✅ Got DATABASE_URL"
echo ""

# Run the update script
npm run update-passwords:pg
