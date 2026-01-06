# Images Directory

This directory should contain all images used in the application.

## Required Images

### Default Images

1. **default-breakfast.jpg** (800x600px)
   - Used when providers don't have photos
   - Should show a generic appealing breakfast scene

2. **default-avatar.png** (200x200px)
   - Default user profile picture
   - Simple icon or silhouette

### Provider Images

Providers can upload images through the dashboard. These will be stored here.

Recommended specs:
- Format: JPG or PNG
- Size: 1200x800px (landscape)
- Max file size: 2MB
- High quality, well-lit photos

### Categories to Showcase

Good breakfast images to have:
- Traditional breakfast spreads
- Continental breakfast items
- Pancakes/waffles
- Fresh pastries
- Coffee and beverages
- Healthy/vegan options

## Adding Images

### Option 1: Manual Upload

Simply place your images in this directory:
```
client/images/
  default-breakfast.jpg
  default-avatar.png
  provider-1.jpg
  provider-2.jpg
  etc.
```

### Option 2: Provider Upload (Future Feature)

You can add file upload functionality:

1. Install multer (already in package.json):
```bash
npm install multer
```

2. Add upload endpoint in server:
```javascript
const multer = require('multer');
const upload = multer({ dest: 'client/images/uploads/' });

app.post('/api/upload', upload.single('image'), (req, res) => {
  res.json({ path: `/images/uploads/${req.file.filename}` });
});
```

3. Update provider dashboard to allow image uploads

## Image Sources

Free stock photos:
- Unsplash: https://unsplash.com/s/photos/breakfast
- Pexels: https://pexels.com/search/breakfast
- Pixabay: https://pixabay.com/images/search/breakfast

## Image Optimization

Before adding images, optimize them:

1. **Online Tools:**
   - TinyPNG: https://tinypng.com
   - Squoosh: https://squoosh.app

2. **Command Line:**
```bash
# Install ImageMagick
brew install imagemagick  # Mac
sudo apt install imagemagick  # Ubuntu

# Resize and optimize
convert input.jpg -resize 1200x800 -quality 85 output.jpg
```

## Current Setup

The app references these image paths:
- Provider listings: `provider.images[0]` or `/images/default-breakfast.jpg`
- User avatars: `user.profileImage` or `/images/default-avatar.png`

Make sure to add these default images for the best user experience!
