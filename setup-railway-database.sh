#!/bin/bash

# Railway Primary Database Setup Script
# Automates the 3-step setup process

set -e

echo "🗄️  Railway Primary Database Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo -e "${GREEN}✅ Railway CLI installed${NC}"
echo ""

# Check if logged in
echo "🔐 Checking Railway login..."
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in. Please run: railway login${NC}"
    echo "   This will open your browser for authentication."
    exit 1
fi

echo -e "${GREEN}✅ Logged in to Railway${NC}"
echo ""

# Link to project (if not already linked)
echo "🔗 Linking to Railway project..."
if [ ! -f ".railway/project.json" ]; then
    echo "   (Select your existing project from the list)"
    railway link || echo "   Project already linked or manual selection needed"
fi

echo ""

# Step 1: Create Volume
echo -e "${BLUE}📦 Step 1: Creating Railway Volume...${NC}"
echo ""

# Check if volume already exists
VOLUME_EXISTS=$(railway volumes 2>/dev/null | grep -c "data-storage" || echo "0")

if [ "$VOLUME_EXISTS" -gt 0 ]; then
    echo -e "${GREEN}✅ Volume 'data-storage' already exists${NC}"
else
    echo "Creating volume 'data-storage' with mount path '/data'..."
    echo ""
    echo -e "${YELLOW}⚠️  Note: Volume creation must be done via Railway Dashboard${NC}"
    echo "   Railway CLI doesn't support volume creation yet."
    echo ""
    echo "   Please do this manually:"
    echo "   1. Go to: Railway Dashboard → Your Service → Settings → Volumes"
    echo "   2. Click 'New Volume'"
    echo "   3. Name: data-storage"
    echo "   4. Mount Path: /data"
    echo "   5. Click 'Create'"
    echo ""
    read -p "Press Enter after creating the volume..."
fi

echo ""

# Step 2: Set Environment Variables
echo -e "${BLUE}⚙️  Step 2: Setting Environment Variables...${NC}"
echo ""

railway variables set DATA_DIR=/data --force
echo -e "${GREEN}   ✅ DATA_DIR=/data${NC}"

railway variables set AUTO_INIT_DB=true --force
echo -e "${GREEN}   ✅ AUTO_INIT_DB=true${NC}"

railway variables set NODE_ENV=production --force
echo -e "${GREEN}   ✅ NODE_ENV=production${NC}"

echo ""

# Step 3: Initialize Database
echo -e "${BLUE}🗄️  Step 3: Initializing Database...${NC}"
echo ""

railway run npm run init-db:seed || {
    echo -e "${YELLOW}⚠️  Database init may have failed (check logs)${NC}"
    echo "   Database will auto-initialize on next deployment"
}

echo ""

# Verify setup
echo -e "${BLUE}🔍 Verifying Setup...${NC}"
echo ""

echo "Environment Variables:"
railway variables | grep -E "DATA_DIR|AUTO_INIT_DB|NODE_ENV" || echo "   (Check Railway dashboard)"

echo ""
echo "Database Status:"
railway run ls -la /data 2>/dev/null || echo "   Database will be created on first deployment"

echo ""
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "   1. Verify volume is mounted: Railway Dashboard → Volumes"
echo "   2. Check deployment: railway logs"
echo "   3. Test API: curl https://your-railway-url.up.railway.app/api/students"
echo ""
echo "📊 Database Collections (12 files in /data):"
echo "   - users.json - User accounts"
echo "   - students.json - Student records"
echo "   - leads.json - CRM leads"
echo "   - materials.json - Course materials"
echo "   - lessons.json - Lessons"
echo "   - assignments.json - Assignments"
echo "   - submissions.json - Submissions"
echo "   - quizzes.json - Quizzes"
echo "   - attempts.json - Quiz attempts"
echo "   - progress.json - Progress tracking"
echo "   - grades.json - Grades"
echo "   - sessions.json - Active sessions"
echo ""
