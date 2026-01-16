# 📐 Image Specifications for Login Background

## 🎯 Required Dimensions

### Option 1: Three Separate Images (Recommended)
Place these 3 images in `public/images/`:

| Image | Dimensions | Description |
|-------|-----------|-------------|
| `login-bg-1.jpg` | **640 × 1080px** | Man in white shirt with water/sky background |
| `login-bg-2.jpg` | **640 × 1080px** | Man in sports attire with tablet |
| `login-bg-3.jpg` | **640 × 1080px** | Man in navy suit with urban background |

**Total Combined:** 1920 × 1080px (Full HD)

### Option 2: Single Merged Image
Place one merged image in `public/images/`:

| Image | Dimensions | Description |
|-------|-----------|-------------|
| `login-background.jpg` | **1920 × 1080px** | All 3 photos merged horizontally |

## 📋 File Requirements

- **Format:** JPG or WebP (optimized)
- **Quality:** 80-90% (balance between quality and file size)
- **File Size:** Keep under 500KB per image (or 1.5MB for merged)
- **Aspect Ratio:** 16:9 (or 3:5 for individual images)

## 🎨 Image Guidelines

1. **Subject Placement:**
   - Keep important subjects (people) in the center of each section
   - Avoid placing faces or important elements at the edges

2. **Color Consistency:**
   - Try to match lighting conditions across all 3 images
   - Similar color temperature for seamless blending

3. **Background:**
   - Ensure backgrounds can blend smoothly
   - Water/sky backgrounds work well for merging

4. **Optimization:**
   - Use tools like TinyPNG or ImageOptim
   - Compress before uploading to reduce load time

## 🔧 How to Use

### Method 1: Three Separate Images (Current Setup)
1. Add images to `public/images/`:
   - `login-bg-1.jpg`
   - `login-bg-2.jpg`
   - `login-bg-3.jpg`
2. The CSS will automatically merge them horizontally

### Method 2: Single Merged Image
1. Merge the 3 photos into one 1920×1080px image
2. Save as `public/images/login-background.jpg`
3. In `index.css`, uncomment:
   ```css
   .login-background-single {
     display: block;
   }
   ```
4. And hide the 3-section layout:
   ```css
   .login-background-merged {
     display: none;
   }
   ```

## ✅ Quick Checklist

- [ ] Images are 640×1080px each (or 1920×1080px for merged)
- [ ] Images are optimized (under 500KB each)
- [ ] Images are in JPG or WebP format
- [ ] Images are placed in `public/images/` folder
- [ ] File names match: `login-bg-1.jpg`, `login-bg-2.jpg`, `login-bg-3.jpg`

## 🚀 After Adding Images

The background will automatically appear on the login page. No code changes needed if you use the exact file names!
