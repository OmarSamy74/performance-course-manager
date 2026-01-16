#!/bin/bash
# Script to copy logo to public directory

echo "📋 Logo Copy Script"
echo "=================="
echo ""
echo "Please provide the path to your SOCCER ANALYTICS PRO logo file:"
echo "Example: /Users/omarsamy/Desktop/logo.png"
echo ""
read -p "Logo file path: " LOGO_PATH

if [ -f "$LOGO_PATH" ]; then
    cp "$LOGO_PATH" public/logo.png
    echo "✅ Logo copied successfully to public/logo.png"
    ls -lh public/logo.png
else
    echo "❌ Error: File not found at $LOGO_PATH"
    exit 1
fi
