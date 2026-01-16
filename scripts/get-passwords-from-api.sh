#!/bin/bash
# Get passwords by calling the admin API endpoint
# Requires: Admin login token

set -e

echo "🔐 Get User Passwords via Admin API"
echo "===================================="
echo ""

# Check if API URL is set
API_URL="${VITE_API_URL:-https://performance-course-manager-production.up.railway.app/api}"

echo "📡 API URL: $API_URL"
echo ""
echo "📋 How to get Admin Token:"
echo "   1. Login as admin on your website"
echo "   2. Open DevTools (F12)"
echo "   3. Go to Network tab"
echo "   4. Click any API request"
echo "   5. Check Headers → Authorization: Bearer YOUR_TOKEN"
echo "   6. Copy the token (without 'Bearer ')"
echo ""
echo "   Or see: docs/HOW_TO_GET_ADMIN_TOKEN.md"
echo ""

# Prompt for admin token
read -p "Enter Admin Auth Token: " ADMIN_TOKEN

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Admin token is required"
    echo ""
    echo "💡 How to get admin token:"
    echo "   1. Login as admin in the web app"
    echo "   2. Open browser DevTools (F12)"
    echo "   3. Go to Network tab"
    echo "   4. Look for any API request"
    echo "   5. Check 'Authorization' header: 'Bearer YOUR_TOKEN'"
    echo "   6. Copy the token (without 'Bearer ')"
    exit 1
fi

echo ""
echo "🔄 Updating passwords via API..."
echo ""

# Call the update passwords endpoint
RESPONSE=$(curl -s -X POST "$API_URL/users/update-passwords" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json")

# Check if request was successful
if echo "$RESPONSE" | grep -q "passwords"; then
    echo "✅ Passwords updated successfully!"
    echo ""
    echo "============================================================"
    echo "📋 NEW PASSWORDS:"
    echo "============================================================"
    
    # Extract passwords from JSON response
    echo "$RESPONSE" | grep -o '"passwords":{[^}]*}' | sed 's/"passwords":{//;s/}//' | tr ',' '\n' | sed 's/"//g' | sed 's/:/: /'
    
    echo "============================================================"
    echo ""
    echo "⚠️  IMPORTANT: Save these passwords immediately!"
else
    echo "❌ Failed to update passwords"
    echo ""
    echo "Response: $RESPONSE"
    echo ""
    echo "💡 Possible issues:"
    echo "   - Invalid admin token"
    echo "   - Not logged in as admin"
    echo "   - API endpoint not accessible"
    exit 1
fi
