# 🖼️ Login Background Setup Guide

## 📐 Recommended Image Dimensions

For the merged horizontal background, use these dimensions:

### **Optimal Dimensions:**
- **Width:** 1920px (Full HD) or 2560px (2K) or 3840px (4K)
- **Height:** 1080px (Full HD) or 1440px (2K) or 2160px (4K)
- **Aspect Ratio:** 16:9

### **Individual Photo Dimensions (Before Merging):**
Each of the 3 photos should be:
- **Width:** 640px (for 1920px total) or 853px (for 2560px total) or 1280px (for 3840px total)
- **Height:** 1080px (Full HD) or 1440px (2K) or 2160px (4K)
- **Format:** JPG or WebP (optimized)

## 🎨 How to Merge Photos Horizontally

### Option 1: Using Image Editing Software (Recommended)

1. **Photoshop/GIMP:**
   - Create new canvas: 1920 × 1080px
   - Place each photo side by side (640px each)
   - Blend edges if needed
   - Export as JPG/WebP

2. **Online Tools:**
   - Use tools like Photopea, Canva, or similar
   - Create 1920 × 1080px canvas
   - Arrange photos horizontally
   - Export optimized image

### Option 2: Using CSS (Current Implementation)

The current setup uses CSS to merge 3 separate images horizontally. Place your images in:

```
public/
  images/
    login-bg-1.jpg  (Man in white shirt - water background)
    login-bg-2.jpg  (Man in sports attire - tablet)
    login-bg-3.jpg  (Man in navy suit - urban background)
```

Then update `index.css`:

```css
.login-bg-section-1 {
  background-image: url('/images/login-bg-1.jpg');
}

.login-bg-section-2 {
  background-image: url('/images/login-bg-2.jpg');
}

.login-bg-section-3 {
  background-image: url('/images/login-bg-3.jpg');
}
```

## 📝 Steps to Add Your Images

1. **Prepare Images:**
   - Resize each photo to 640 × 1080px (or maintain aspect ratio)
   - Optimize for web (compress to reduce file size)
   - Save as JPG or WebP

2. **Place Images:**
   - Create folder: `public/images/`
   - Add your 3 images:
     - `login-bg-1.jpg`
     - `login-bg-2.jpg`
     - `login-bg-3.jpg`

3. **Update CSS:**
   - Open `index.css`
   - Replace the placeholder URLs with your image paths
   - Example: `url('/images/login-bg-1.jpg')`

## 🎯 Alternative: Single Merged Image

If you prefer a single merged image:

1. Merge the 3 photos into one 1920 × 1080px image
2. Save as `public/images/login-background.jpg`
3. Update CSS:

```css
.login-background-merged {
  background-image: url('/images/login-background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-bg-section {
  display: none; /* Hide individual sections */
}
```

## ✅ Current Implementation

The login page now has:
- ✅ Horizontal merged background structure
- ✅ 3 sections for 3 photos
- ✅ Overlay for better text readability
- ✅ Responsive design
- ✅ Ready for your images

Just add your images to `public/images/` and update the CSS paths!
