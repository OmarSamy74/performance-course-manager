#!/bin/bash
# Update passwords manually by prompting for DATABASE_URL

set -e

echo "🔐 Update User Passwords in PostgreSQL"
echo "======================================"
echo ""
echo "📋 To get DATABASE_URL:"
echo "   1. Go to Railway Dashboard → PostgreSQL service"
echo "   2. Click 'Connect' or 'Connection' tab"
echo "   3. Copy the PUBLIC connection string"
echo "   4. (Should have .railway.app, NOT .railway.internal)"
echo ""
echo ""

# Prompt for DATABASE_URL
read -p "Enter PUBLIC DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is required"
    exit 1
fi

# Check if it's internal URL
if [[ "$DATABASE_URL" == *".railway.internal"* ]]; then
    echo ""
    echo "⚠️  Warning: This is an internal URL and won't work from your local machine"
    echo ""
    echo "You need the PUBLIC DATABASE_URL:"
    echo "  1. Go to Railway Dashboard → PostgreSQL service"
    echo "  2. Click 'Connect' or 'Connection' tab"
    echo "  3. Copy the PUBLIC connection string (not .railway.internal)"
    echo ""
    read -p "Continue anyway? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🔐 Updating passwords..."
echo ""

export DATABASE_URL
npm run update-passwords:pg
