#!/bin/bash
# Copy images and logo from Desktop to project

SOURCE_DIR="/Users/omarsamy/Desktop/image"
PROJECT_IMAGES="public/images"
PROJECT_ROOT="public"

echo "📋 Copying images and logo..."
echo ""

# Copy all images from Desktop/image to public/images
if [ -d "$SOURCE_DIR" ]; then
    echo "📁 Copying images from: $SOURCE_DIR"
    cp -v "$SOURCE_DIR"/*.{png,jpg,jpeg,PNG,JPG,JPEG} "$PROJECT_IMAGES"/ 2>/dev/null
    echo "✅ Images copied to: $PROJECT_IMAGES"
else
    echo "⚠️  Image folder not found: $SOURCE_DIR"
fi

# Check for logo files
echo ""
echo "🔍 Looking for logo files..."

# Check if Gemini image is the logo
if [ -f "$PROJECT_IMAGES/Gemini_Generated_Image_gtzfvygtzfvygtzf-removebg-preview.png" ]; then
    echo "📌 Found potential logo: Gemini_Generated_Image_gtzfvygtzfvygtzf-removebg-preview.png"
    cp "$PROJECT_IMAGES/Gemini_Generated_Image_gtzfvygtzfvygtzf-removebg-preview.png" "$PROJECT_ROOT/logo.png"
    echo "✅ Copied as logo.png"
fi

# Check Desktop for logo files
if [ -f "/Users/omarsamy/Desktop/3.png" ]; then
    echo "📌 Found: 3.png on Desktop"
    read -p "Use 3.png as logo? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp "/Users/omarsamy/Desktop/3.png" "$PROJECT_ROOT/logo.png"
        echo "✅ Copied 3.png as logo.png"
    fi
fi

echo ""
echo "📊 Summary:"
ls -lh "$PROJECT_IMAGES"/*.{png,jpg,jpeg} 2>/dev/null | wc -l | xargs echo "Images in public/images:"
ls -lh "$PROJECT_ROOT/logo.png" 2>/dev/null && echo "✅ Logo found: $PROJECT_ROOT/logo.png" || echo "⚠️  Logo not found"

echo ""
echo "✅ Done!"
