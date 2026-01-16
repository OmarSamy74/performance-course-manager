#!/bin/bash
# Setup login background images

IMAGES_DIR="public/images"
DESKTOP_IMAGES="/Users/omarsamy/Desktop/image"

echo "🖼️  Setting up login background images..."
echo ""

# Check if we have 3 images for the login background
images=($(ls "$IMAGES_DIR"/*.{png,jpg,jpeg} 2>/dev/null | head -3))

if [ ${#images[@]} -ge 3 ]; then
    echo "✅ Found ${#images[@]} images"
    
    # Copy first 3 images as login backgrounds
    cp "${images[0]}" "$IMAGES_DIR/login-bg-1.jpg" 2>/dev/null || cp "${images[0]}" "$IMAGES_DIR/login-bg-1.png" 2>/dev/null
    cp "${images[1]}" "$IMAGES_DIR/login-bg-2.jpg" 2>/dev/null || cp "${images[1]}" "$IMAGES_DIR/login-bg-2.png" 2>/dev/null
    cp "${images[2]}" "$IMAGES_DIR/login-bg-3.jpg" 2>/dev/null || cp "${images[2]}" "$IMAGES_DIR/login-bg-3.png" 2>/dev/null
    
    echo "✅ Created login-bg-1, login-bg-2, login-bg-3"
else
    echo "⚠️  Need at least 3 images for login background"
    echo "📁 Available images:"
    ls -lh "$IMAGES_DIR"/*.{png,jpg,jpeg} 2>/dev/null | head -5
fi

echo ""
echo "✅ Done!"
