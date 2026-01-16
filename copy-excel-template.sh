#!/bin/bash
# Copy Excel template to Desktop for easy access

SOURCE="public/templates/leads-template.xlsx"
DEST="$HOME/Desktop/leads-template.xlsx"

if [ -f "$SOURCE" ]; then
    cp "$SOURCE" "$DEST"
    echo "✅ تم نسخ ملف Excel إلى Desktop"
    echo "📁 الموقع: $DEST"
    open "$HOME/Desktop" 2>/dev/null || echo "افتح Desktop للعثور على الملف"
else
    echo "❌ لم يتم العثور على الملف: $SOURCE"
    echo "💡 قم بتشغيل: node scripts/generate-leads-template.js"
    exit 1
fi
