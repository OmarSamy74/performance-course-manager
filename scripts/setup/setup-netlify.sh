#!/bin/bash

# Netlify Setup Script
# Run this after logging in with: netlify login

set -e

echo "🌐 Netlify Setup Script"
echo "======================="
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

echo "✅ Netlify CLI installed"
echo ""

# Navigate to project
cd "$(dirname "$0")"
echo "📁 Project directory: $(pwd)"
echo ""

# Check if logged in
echo "🔐 Checking Netlify login status..."
if ! netlify status &> /dev/null; then
    echo "⚠️  Not logged in. Please run: netlify login"
    echo "   This will open your browser for authentication."
    exit 1
fi

echo "✅ Logged in to Netlify"
echo ""

# Link to site (if not already linked)
echo "🔗 Linking to Netlify site..."
if netlify link --help &> /dev/null; then
    echo "   (Select your existing site from the list)"
    netlify link || echo "   Site already linked or manual selection needed"
fi

echo ""

# Set environment variables
echo "⚙️  Setting environment variables..."

netlify env:set NODE_ENV production
echo "   ✅ NODE_ENV=production"

netlify env:set VITE_API_URL "https://performance-course-manager-production.up.railway.app/api"
echo "   ✅ VITE_API_URL set"

netlify env:set NODE_VERSION 18
echo "   ✅ NODE_VERSION=18"

netlify env:set NPM_CONFIG_PRODUCTION false
echo "   ✅ NPM_CONFIG_PRODUCTION=false"

echo ""

# Verify netlify.toml exists
echo "📋 Checking netlify.toml configuration..."
if [ -f "netlify.toml" ]; then
    echo "   ✅ netlify.toml found"
    cat netlify.toml | head -20
else
    echo "   ⚠️  netlify.toml not found (should exist)"
fi

echo ""

# Test build locally
echo "🔨 Testing build locally..."
if npm run build; then
    echo "   ✅ Build successful"
else
    echo "   ⚠️  Build failed (check errors above)"
    exit 1
fi

echo ""

# Deploy
echo "🚀 Deploying to Netlify..."
netlify deploy --prod || {
    echo "   ⚠️  Deployment failed (check logs above)"
    exit 1
}

echo ""

# Check status
echo "📊 Checking Netlify status..."
netlify status

echo ""

# Show recent logs
echo "📋 Recent deployment logs:"
netlify logs --tail 30

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Check logs: netlify logs:watch"
echo "   2. Verify deployment: netlify status"
echo "   3. Open site: netlify open:site"
echo "   4. Test functions: netlify functions:list"
echo ""
