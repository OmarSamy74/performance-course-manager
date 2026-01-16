# 📋 Copy Logo Command

## Quick Copy Command

If you have the logo file ready, use this command:

```bash
cp /path/to/your/logo.png public/logo.png
```

## Example

```bash
# If logo is on Desktop
cp ~/Desktop/logo.png public/logo.png

# If logo is in Downloads
cp ~/Downloads/logo.png public/logo.png

# If logo is in a specific folder
cp /Users/omarsamy/Desktop/SOCCER_ANALYTICS_LOGO.png public/logo.png
```

## Using the Script

We've created a helper script for you:

```bash
./copy-logo.sh
```

This will prompt you for the logo file path and copy it automatically.

## Verify Logo

After copying, verify the logo is in place:

```bash
ls -lh public/logo.png
```

## Logo Requirements

- **Format**: PNG (recommended) or JPG
- **Size**: 200x200px minimum (larger is fine)
- **Background**: Transparent PNG preferred
- **Location**: Must be named `logo.png` in `public/` folder

## Notes

- The logo will be automatically used in:
  - Login page header
  - Navbar (top navigation)
  - Anywhere the logo is referenced
